'use server';

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { convertToPlainObject, formatError } from "../utils";
import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.actions";
import { insertOrderSchema } from "../validators";
import { prisma } from "../prisma";
import { CartItem, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";
import { PAGE_SIZE } from "../constants";
import { Prisma } from "../generated/prisma/client";

// Create order and create order items

export async function createOrder(){
    try {
        const session = await auth();
        if(!session) throw new Error('User Not Authenticated');
        
        const cart = await getMyCart();
        const userId = session.user?.id;

        if(!userId) throw new Error('User Not Found');

        const user = await getUserById(userId);


        if(!cart || cart.items.length === 0){
            return {
                success:false,
                message:'Your Cart Is Empty',
                redirectTo:'/cart'
            }
        }

        if(!user.addresses){
            return {
                success:false,
                message:'No Shipping Address',
                redirectTo:'/shipping-address'
            }
        }

        if(!user.paymentMethod){
            return {
                success:false,
                message:'No Payment Method',
                redirectTo:'/payment-method'
            }
        }

        // Create an order object
        const order = insertOrderSchema.parse({
            userId:user.id,
            itemsPrice:cart.itemsPrice,
            shippingPrice:cart.shippingPrice,
            taxPrice:cart.taxPrice,
            totalPrice:cart.totalPrice,
            paymentMethod:user.paymentMethod,
            shippingAddress: user.addresses,
        })

        // Create a transaction to create order and order items in database
        const insertedOrderId = await prisma.$transaction(async(tx)=>{
            // Create order
            const insertOrder = await tx.order.create({data: order});

            // Create order items from the cart items
            for(const item of cart.items as CartItem[]){
                await tx.orderItem.create({
                    data:{
                        ...item,
                        price:item.price,
                        orderId:insertOrder.id
                    }
                })
            }

            // Clear cart
            await tx.cart.update({

                where:{id:cart.id},
                data:{
                    items:[],
                    totalPrice:0,
                    taxPrice:0,
                    shippingPrice:0,
                    itemsPrice:0
                }
            });

            return insertOrder.id;
        });

        if(!insertedOrderId) throw new Error('Order Not Created');

        return {
            success:true,
            message:'Order Created',
            redirectTo:`/order/${insertedOrderId}`
        }
        
    } catch (error) {
        if(isRedirectError(error)) throw error;
        return {
            success:false,
            message:formatError(error)
        }

    }
}


// Get Order By Id
export async function getOrderById(orderId: string){
    const data = await prisma.order.findFirst({
        where:{
            id:orderId
        },
        include:{
            orderItems:true,
            user:{select:{name:true, email:true}}
        }
    })

    return convertToPlainObject(data);
}


// Create new paypal order
export async function createPaypalOrder(orderId:string){
    try {

        const order = await prisma.order.findFirst({
            where:{
                id:orderId
            }
        });

        if(order){
            // Create paypal order
            const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

            // update order with paypal order id
            await prisma.order.update({
                where:{id:orderId},
                data:{
                    paymentResult:{
                        id:paypalOrder.id,
                        email_address:'',
                        status:'',
                        pricePaid:0,
                    }
                }
            });

            return {
                success:true,
                message:'Item order created successfully',
                data:paypalOrder.id
            }
        }else{
            throw new Error('Order Not Found');
        }
        
    } catch (error) {
        return {
            success:false,
            message:formatError(error)
        }
    }
}


// Approve paypal order and update to paid
export async function approvePaypalOrder(orderId:string, data:{orderId:string}){
    try {
        // Get order from database
        const order = await prisma.order.findFirst({
            where:{
                id:orderId
            }
        })

        if(!order) throw new Error('Order Not Found');
        const captureData = await paypal.capturePayment(data.orderId);
        console.log("captureData",captureData);
        if(!captureData || captureData.id !== (order.paymentResult as PaymentResult)?.id || captureData.status !== "COMPLETED"){
            throw new Error('Error in PayPal Payment');
        }

        // Update order to paid
        await updateOrderToPaid({
            orderId,
            paymentResult:{
                id:captureData.id,
                status:captureData.status,
                email_address:captureData.payer.email_address,
                pricePaid:captureData.purchase_units[0]?.payments.captures[0]?.amount?.value
            }
        })

        revalidatePath(`/order/${orderId}`);

        return {
            success:true,
            message:'Your order has been paid'
        }
        
    } catch (error) {
        console.log("capture Error", error)
        return {
            success:false,
            message:formatError(error)
        }
    }
}

// Update order to paid

async function updateOrderToPaid({
    orderId,
    paymentResult
}:{
    orderId:string,
    paymentResult?: PaymentResult
}){
    const order = await prisma.order.findFirst({
        where:{
            id:orderId
        },
        include:{
            orderItems:true
        }
    })

    if(!order) throw new Error('Order Not Found');

    if(order.isPaid) throw new Error('Order is already paid');

    // Transaction to update order and account for product stock
    await prisma.$transaction(async (tx)=>{
        // Iterate over products and update stock
        for(const item of order.orderItems){
            await tx.product.update({
                where:{id:item.productId},
                data:{
                    stock:{increment:-item.qty}
                }
            });
        }

        // Set the order to pad
        await tx.order.update({
            where:{id:orderId},
            data:{
                isPaid:true,
                paidAt:new Date(),
                paymentResult,
            }
        })
    });

    // Get Updated order after transaction
    const updatedOrder = await prisma.order.findFirst({
        where:{
            id:orderId
        },
        include:{
            orderItems:true,
            user:{select:{name:true, email:true}}
        }
    });

    if(!updatedOrder) throw new Error('Order Not Found');
}



// Get The User Orders

export async function getMyOrder({limit=PAGE_SIZE, page}:{limit?:number, page:number}){
    const session = await auth();
    if(!session) throw new Error('User is not authorized');
    const data = await prisma.order.findMany({
        where:{userId:session.user?.id},
        orderBy:{createdAt:'desc'},
        take:limit,
        skip:(page - 1) * limit
    })

    const dataCount = await prisma.order.count({
        where:{userId:session.user?.id}
    });

    return {
        data,
        totalPages:Math.ceil(dataCount / limit),
    }
}

type SalesDataType = {
    month:string;
    totalSales: number;
}[];

// Get sales data and order summary
export async function getOrderSummary(){
    // Get count for each reasource
    const ordersCount = await prisma.order.count();
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();
    
    // Calculate the total sales
    const totalSales = await prisma.order.aggregate({_sum:{totalPrice:true}});


    // Get monthly sales 
    const salesDataRaw = await prisma.$queryRaw<Array<{month: string, totalSales: Prisma.Decimal}>>`
        SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" 
        FROM "Order" 
        GROUP BY to_char("createdAt", 'MM/YY')
    `;

    const salesData:SalesDataType = salesDataRaw.map((entry)=>({
        month:entry.month,
        totalSales: Number(entry.totalSales)
    }));
    
    // Get latest sales
    const latestSales = await prisma.order.findMany({
        orderBy: { createdAt:'desc' },
        include: { 
            user:{select:{name:true}}
        },
        take:6
    });

    return {
        ordersCount,
        productsCount,
        usersCount,
        totalSales,
        latestSales,
        salesData
    }

}


// Get All Orders 
export async function getAllOrders({limit=PAGE_SIZE || 10, page, query}:{limit?:number, page:number, query?:string}){
    
    const queryFilter:Prisma.OrderWhereInput = query && query!=='' ? {
        user:{
            name:{
                contains:query,
                mode:'insensitive'
            } as Prisma.StringFilter
        }
    }:{};
    
    const data = await prisma.order.findMany({
        where:{
            ...queryFilter
        },
        orderBy:{'createdAt':'desc'},
        take:limit,
        skip:(page - 1) * limit,
        include:{user:{select:{name:true}}} 
    })

    const dataCount = await prisma.order.count();

    return {
        data,
        totalPages: Math.ceil(dataCount/limit),
    }
}


// Delete an order by id
export async function deleteOrder(id:string){
    try {

        await prisma.order.delete({where:{id}});

        revalidatePath('/admin/orders');
        return {
            success:true,
            message:'Order Deleted Successfully'
        }
    } catch (error) {
        return {
            success:false,
            message:formatError(error)
        }
    }
}


// Update COD Order to paid 
export async function updateOrderToPaidCOD(orderId:string){
    try {
        await updateOrderToPaid({orderId});

        revalidatePath(`/order/${orderId}`);

        return {
            success:true,
            message: 'Order marked as paid'
        }

    } catch (error) {
        return{
            status:false,
            message:formatError(error)
        }
    }
}

// Update COD Order to delivered
export async function updateOrderToPaidDelivered(orderId:string){
    try {

        const order = await prisma.order.findFirst({
            where:{id:orderId}
        });

        if(!order) throw new Error("Order not found");

        if(!order.isPaid) throw new Error("Order is not paid");

        await prisma.order.update({
            where:{id:orderId},
            data:{isDelivered:true, deliveredAt: new Date()}
        })

        revalidatePath(`/order/${orderId}`);

        return {
            success:true,
            message: 'Order has been marked delivered'
        }

    } catch (error) {
        return{
            status:false,
            message:formatError(error)
        }
    }
}