'use client';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Product } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";

const ProductCarousel = ({data, title}:{data:Product[], title?:string}) => {
    return (
        <Carousel className="w-full mb-12" opts={{loop:true}} plugins={[
            Autoplay({
                delay:5000,
                stopOnInteraction:true,
                stopOnMouseEnter:true
            })
        ]}>
            <CarouselContent>
                {data.map((product:Product)=>(
                    <CarouselItem key={product.id}>
                        <Link href={`/product/${product.slug}`} className="block w-full h-full">
                            <div className="relative mx-auto">
                                <Image src={product.banner? product.banner.includes('https') ? product.banner : `/images/${product.banner}` : "/images/placeholder.jpg" } alt={product.name} width={0} height={0} sizes="100vw" className="w-full h-auto" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                    <h3 className="text-white text-lg font-bold">{product.name}</h3>
                                </div>
                            </div>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious/>
            <CarouselNext/>
        </Carousel>
    );
}
 
export default ProductCarousel;