'use server';

import { auth } from "@/auth";
import { CartItem } from "@/types";
import { cookies } from "next/headers";
import { prisma } from "../prisma";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { cartItemSchema, insertCartSchema, paymentMethodSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "../generated/prisma/client";
import {success, z} from 'zod'

// Calculate cart prices
const calcPrice = (items:CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item)=>acc + (Number(item.price)* item.qty), 0), 
    ),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(itemsPrice * 0.15),
    totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2)
    }
}

export async function  addItemToCart(data: CartItem){
    try {
        // Check for cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;

        if(!sessionCartId) throw new Error("Cart session not found");

        // Get session and user id 
        const session = await auth();
        const userId = session?.user?.id ? (session.user.id as string) : undefined;
        
        // Get cart 
        const cart = await getMyCart();
        
        // Parse and validate item
        const item = cartItemSchema.parse(data);

        // Find product in database
        const product = await prisma.product.findFirst({
            where:{id: item.productId}
        })

        if(!product) throw new Error("Product not found");

        if(!cart){
            // Create new cart
            const newCart = insertCartSchema.parse({
                userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calcPrice([item])
            })
            // console.log(newCart);

            // Add to database
            await prisma.cart.create({
                data: newCart
            });

            // Revalidate product page
            revalidatePath(`/product/${product.slug}`);
            return {
                success:true,
                message: `${product.name} added to cart`
            }
        }else{
            // Check if item already exists in cart
            const existItem = (cart.items as CartItem[]).find((x)=>x.productId === item.productId);

            if(existItem){
                // Check Stock 
                if(product.stock <= existItem.qty) throw new Error("Not enough stock");

                // Increase the quantity
                (cart.items as CartItem[]).find((x)=>x.productId === item.productId)!.qty =  existItem.qty + 1; 
            }else{
                // If item does not exist in cart
                if(product.stock < 1) throw new Error('Not enough stock');

                // Add item to the cart.items
                cart.items.push(item);
            }

            // Save to Database
            await prisma.cart.update({
                where: {id:cart.id},
                data:{
                    items:cart.items as Prisma.CartUpdateitemsInput[],
                    ...calcPrice(cart.items as CartItem[])
                }
            });

            revalidatePath(`/product/${product.slug}`);
            
            return {
                success:true,
                message: `${product.name} ${existItem ? 'Updated In' : 'added to'}  cart`
            }

        }
        
        
    } catch (error) {
        return {
            success:false,
            message: "Failed to add item to cart"
        }
    }
}

export async function getMyCart(){
    // Check for cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;

    if(!sessionCartId) throw new Error("Cart session not found");

    // Get session and user id 
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get user cart from database
    const cart = await prisma.cart.findFirst({
        where: userId ? {userId} : {sessionCartId: sessionCartId},
    });

    if(!cart) return undefined;

    // Convert decimals to return
    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),

    })
}

export async function removeItemFromCart(productId:string){
    try {
        // Check for cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;
        if(!sessionCartId) throw new Error("Cart session not found");

        // Get Product 
        const product = await prisma.product.findFirst({
            where:{id:productId}
        });

        if(!product) throw new Error('Product Not Found');

        // Get user cart
        const cart = await getMyCart();
        if(!cart) throw new Error('Cart Not Found');

        // Check for item
        const exist = (cart.items as CartItem[]).find((x)=>x.productId === productId)
        if(!exist) throw new Error('Item Not Found');

        // Check if only one in qty
        if(exist.qty === 1){
            // Remove from the cart
            cart.items = (cart.items as CartItem[]).filter((x)=>x.productId !== exist.productId);
        }else{
            // Decrease qty
            (cart.items as CartItem[]).find((x)=>x.productId === productId)!.qty = exist.qty - 1;
        }

        // Update cart in database
        await prisma.cart.update({
            where:{id:cart.id},
            data:{
                items:cart.items as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[])
            }
        });

        revalidatePath(`/product/${product.slug}`);

        return {
            success:true,
            message: `${product.name} was removed from cart`
        }
        
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }
}

// Update user's payment method
export async function updateUserPaymentMethod(data: z.infer<typeof paymentMethodSchema>){
    try {
        const session = await auth();

        const currentUser = await prisma.user.findFirst({
            where:{id:session?.user?.id}
        });

        if(!currentUser) throw new Error("User Not Found");

        const paymentethod = paymentMethodSchema.parse(data);

        await prisma.user.update({
            where:{id:currentUser.id},
            data:{paymentMethod:paymentethod.type}
        });

        return {
            success:true,
            message:"User updated payment method successfully"
        }
    } catch (error) {
        return {
            success:false,
            message:formatError(error)
        }    
    }
}