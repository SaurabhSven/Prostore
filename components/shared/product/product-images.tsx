'use client';

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

const ProductImages = ({images}:{images:string[]}) => {
    const [current, setCurrent] = useState(0);

    return ( 
        <div className="flex flex-col gap-4">
            <div className="flex justify-center">
                <Image src={images[current]} alt="Product Image" width={1000} height={1000} className="min-h-[300px] object-cover object-center" />
            </div>
            <div className="flex gap-2">
                {images.map((image, index) => (
                    <button key={index} onClick={() => setCurrent(index)} className={cn('border mr-2 cursor-pointer hover:border-orange-600', current === index && 'border-orange-500')}>
                        <Image src={image} alt={`Product Image ${index + 1}`} width={100} height={100} />
                    </button>
                ))}
            </div>
        </div>
    );
}
 
export default ProductImages;