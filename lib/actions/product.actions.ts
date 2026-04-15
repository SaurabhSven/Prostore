'use server'
import { revalidatePath } from "next/cache";
import { LATEST_PRODUCTS_LIMIT, PAGE_SIZE } from "../constants";
import { prisma } from "../prisma";
import { convertToPlainObject, formatError } from "../utils";
import z from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";
import { Prisma } from "../generated/prisma/client";

// Get Latest products
export async function getLatestProducts(){

    const data = await prisma.product.findMany({
        take:LATEST_PRODUCTS_LIMIT,
        orderBy:{ createdAt:'desc' }
    });

    return convertToPlainObject(data)
}

// Get Single Product by slug
export async function getProductBySlug(slug:string){
    const data = await prisma.product.findUnique({
        where:{ slug }
    });
    return convertToPlainObject(data);
} 

// Get Single Product by id
export async function getProductById(id:string){
    const data = await prisma.product.findUnique({
        where:{ id }
    });
    return convertToPlainObject(data);
} 

// Get All Products
export async function getAllProducts({
    query,
    limit=PAGE_SIZE,
    page,
    category,
    price,
    rating,
    sort
}:{
    query:string,
    limit?:number,
    page:number,
    category?:string,
    price?:string,
    rating?:string,
    sort?:string
}){

    // Query Filter
    const queryFilter:Prisma.ProductWhereInput = query && query!=='' ? {
        name:{
            contains:query,
            mode:'insensitive'
        } as Prisma.StringFilter
    }:{};

    // Category Filter
    const categoryFilter:Prisma.ProductWhereInput = category && category !== 'all' ? {category}:{};

    // Price Filter
    const priceFilter:Prisma.ProductWhereInput = price && price!=='all' ? {
        price:{
            gte:Number(price.split('-')[0]),
            lte:Number(price.split('-')[1])
        }
    }:{};

    // Rating Filter
    const ratingFilter:Prisma.ProductWhereInput = rating && rating !== 'all' ? {
        rating:{
            gte:Number(rating)
        }
    }:{};

    const data = await prisma.product.findMany({
        where:{
            ...queryFilter,
            ...categoryFilter,
            ...priceFilter,
            ...ratingFilter
        },
        orderBy: sort === 'newest'
        ? { createdAt:'desc' } : sort === 'oldest'
        ? { createdAt:'asc' } : sort === 'lowest' 
        ? { price:'asc' } : sort === 'highest'
        ? { price:'desc' } : sort === 'rating' 
        ? { rating:'desc' } : { createdAt:'desc' },
        skip:(page - 1) * limit,
        take:limit
    });

    const dataCount = await prisma.product.count();

    return {
        data,
        totalPages:Math.ceil(dataCount/limit)
    }
}


// Delete a product
export async function deleteProduct(id:string){

    try {
        const productExist = await prisma.product.findFirst({
            where:{id}
        });

        if(!productExist) throw new Error("Product not found");

        await prisma.product.delete({where:{id}});

        revalidatePath('/admin/products');

        return{
            success:true,
            message:"Product deleted successfully"
        }
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }
}


// Create a product
export async function createProduct(data:z.infer<typeof insertProductSchema>){

    try {
        const product = insertProductSchema.parse(data);
        await prisma.product.create({
            data:product
        });

        revalidatePath('/admin/products');
        
        return{
            success:true,
            message:"Product created successfully"
        }
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }
}

// Update a product
export async function updateProduct(data:z.infer<typeof updateProductSchema>){

    try {
        const product = updateProductSchema.parse(data);

        const productExist = await prisma.product.findFirst({
            where:{id:product.id}
        });

        if(!productExist) throw new Error("Product not found");

        await prisma.product.update({
            where:{id:product.id},
            data:product
        });

        revalidatePath('/admin/products');
        
        return{
            success:true,
            message:"Product updated successfully"
        }
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }
}


// Get All Categories

export async function getAllCategories(){
    const data = await prisma.product.groupBy({
        by:['category'],
        _count:true
    })

    return data;
}


// Get Featured Products
export async function getFeaturedProducts(){
    const data = await prisma.product.findMany({
        where:{ isFeatured:true },
        orderBy:{ createdAt:'desc' },
        take:4
    });

    return convertToPlainObject(data);
}