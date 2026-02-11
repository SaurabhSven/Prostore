'use client';

import { Button } from "@/components/ui/button";
import { Cart, CartItem } from "@/types";
import { Plus, Minus, Loader } from "lucide-react";
import { toast } from "sonner";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const AddToCart = ({cart, item}:{cart?:Cart, item:CartItem}) => {
    // console.log(item);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const handleAddToCart = async () => {
        startTransition(async ()=>{
            const response = await addItemToCart(item);
            if(response.success){
                toast.success(response.message,{
                    action: {
                        label: "View Cart",
                        onClick: () => {router.push("/cart")}
                    }
                });
                router.refresh();
            } else {
                toast.error("Failed to add item to cart");
            }
        })
    }

    const handleRemoveFromCart = async () =>{
        startTransition(async ()=>{
            const res = await removeItemFromCart(item.productId);
    
            if(res.success){
                toast.warning(res.message);
                router.refresh();
            } else {
                toast.error("Failed to add item to cart");
            }
            return;
        })
    }

    // Check if item is in cart
    const existItem  = cart && cart.items.find((x)=>x.productId === item.productId);
    return existItem ? (
        <div className="mt-2">
            <Button type="button" variant={'outline'} onClick={handleRemoveFromCart}>
                {isPending ? (
                    <Loader className="h-4 w-4 animate-spin"/>
                ) : (
                    
                    <Minus className="h-4 w-4"/>
                )}
            </Button>
            <span className="px-2">{existItem.qty}</span>
            <Button type="button" variant={'outline'} onClick={handleAddToCart}>
                {isPending ? (
                    <Loader className="h-4 w-4 animate-spin"/>
                ) : (
                    <Plus className="h-4 w-4"/>
                )}
            </Button>
        </div>
    ) : ( <>
        <Button className="mt-6" size={'lg'} onClick={handleAddToCart} disabled={item.qty <= 0}>
            {isPending ? (
                    <Loader className="h-4 w-4 animate-spin"/>
                ) : item.qty > 0 ? "Add to Cart" : "Out Of Stock" 
            }
        </Button>
    </> );
}
 
export default AddToCart;