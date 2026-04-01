
import AddToCart from "@/components/shared/product/add-to-cart";
import ProductImages from "@/components/shared/product/product-images";
import ProductPrice from "@/components/shared/product/product-price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { Product } from "@/types";
import { notFound } from "next/navigation";

const ProductDetailsPage = async (props:{
    params:Promise<{slug:string}>
}) => {
    const { slug } = await props.params;
    const product: Product | null = await getProductBySlug(slug);
    if(!product) notFound();
    const cart = await getMyCart();

    return (
    <>
    <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-12">
            {/* Image Column */}
            <div className="col-span-2">
                <ProductImages images={product.images} />
            </div>
            {/* Details Column */}
            <div className="col-span-3 p-5">
                <div className="mb-2">
                    <Badge>{product.brand} {product.category}</Badge>
                </div>
                <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
                <p className="mb-5 text-right">
                    {product.rating} Stars | {0} Reviews
                </p>
                <ProductPrice value={product.price} className="text-4xl"/>
                <p className="mt-4 flex flex-col gap-1">
                    <span className="font-semibold">
                        Description : 
                    </span>
                    <span className="font-light">
                        {product.description}
                    </span>
                </p>
                <AddToCart 
                cart={cart}
                item={
                    {
                        productId:product.id,
                        name:product.name,
                        slug:product.slug,
                        qty:1,
                        image:product.images![0],
                        price:product.price
                    }
                } />
            </div>
        </div>

    </section>
    </>
    );
}

export default ProductDetailsPage;