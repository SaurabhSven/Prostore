'use server'
import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { prisma } from "../prisma";
import { convertToPlainObject } from "../utils";

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