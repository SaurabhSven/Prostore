import { getOrderById } from "@/lib/actions/order.action";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import {OrderItem, ShippingAddress} from "@/types";
import OrderDetailsTable from "./order-details-table";
import { auth } from "@/auth";

export const metadata:Metadata={
    title:'Order Details'
}

const OrderDetailsPage = async (props: {
    params: Promise<{id:string}>
}) => {
    const {id} = await props.params;
    const order = await getOrderById(id);
    const session = await auth();

    if(!order) notFound();

    return (
        <>
            <OrderDetailsTable 
            order={{
                ...order,
                shippingAddress: order.shippingAddress as ShippingAddress,
                user: { ...order.user, name: order.user.name ?? '' },
            }}
            paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb' }
            isAdmin={session?.user.role === 'admin' || false}
            />
        </>
    );
}
 
export default OrderDetailsPage;