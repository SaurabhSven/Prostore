'use server';

import { shippingAddressSchema, signInFormSchema, signUpFormSchema, updateUserSchema } from "../validators";
import {auth, signIn, signOut} from '@/auth';
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "../prisma";
import { ShippingAddress } from "@/types";
import { formatError } from "../utils";
import { PAGE_SIZE } from "../constants";
import { revalidatePath } from "next/cache";
import z from "zod";
import { Prisma } from "../generated/prisma/client";
// Sign in the user with credentials
export async function signInWithCredentials(prevState:unknown, formData:FormData){
    try {
        const user = signInFormSchema.parse({
            email: formData.get('email'),
            password: formData.get('password'),
        });

        await signIn('credentials', user);
        return { success:true, message: 'Signed in successfully' };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return { success:false, message: 'Invalid email or password' };
    }
}

// Sign out the user
export async function signOutUser(){
    await signOut();
}

// Signing Up the user with credentials
export async function signUpUser(prevState:unknown, formData:FormData){
    try {
        const user = signUpFormSchema.parse({
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
        });

        const plainPassword = user.password;
        
        user.password = hashSync(user.password, 10);

        const existingUser = await prisma.user.findFirst({
            where: {email: user.email}
        });

        if(existingUser){
            return { success:false, message: 'Email is already registered' };
        }

        await prisma.user.create({
            data:{
                name: user.name,
                email: user.email,
                password: user.password,
            }
        });

        await signIn('credentials', { email: user.email, password: plainPassword });
        return { success:true, message: 'Signed up and signed in successfully' };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }
        return { success:false, message: 'User was not registered' };
    }
}


// Get user by the ID
export async function getUserById(userId:string){
    const user = await prisma.user.findFirst({
        where:{id:userId}
    })

    if(!user) throw new Error("User Not Found");

    return user
}

// Update the user's address
export async function updateUserAddress(data:ShippingAddress){
    try {

        const session = await auth();

        const currentUser = await prisma.user.findFirst({
            where:{id:session?.user?.id}
        })

        if(!currentUser) throw new Error("User Not Found");

        const address = shippingAddressSchema.parse(data);

        await prisma.user.update({
            where:{id:currentUser.id},
            data:{addresses : address}
        });

        return {
            success:true,
            message: "User updated successfully"
        }
        
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }
}

// Update the user profile 
export async function updateProfile(user:{name:string, email:string}){
    try {
        const session = await auth();
        const currentUser = await prisma.user.findFirst({
            where:{id:session?.user?.id}
        })
        if(!currentUser) throw new Error("User Not Found");
        await prisma.user.update({
            where:{id:currentUser.id},
            data:{
                name:user.name,
            }
        })

        return {
            success:true,
            message:'User Updated Successfully'
        }
    } catch (error) {
        return {
            success:false,
            message:formatError(error)
        }
    }
}


// Get all users
export async function getAllUsers({limit= PAGE_SIZE, page, query}:{limit?:number, page:number, query:string}){

    const queryFilter:Prisma.UserWhereInput = query && query!=='' ? {
        name:{
            contains:query,
            mode:'insensitive'
        } as Prisma.StringFilter
        }:{};

    const data = await prisma.user.findMany({
        where:{
            ...queryFilter
        },
        orderBy:{ updatedAt:'desc' },
        skip:(page - 1) * limit, 
        take:limit
    })

    const dataCount = await prisma.user.count();

    return {
        data,
        totalPages:Math.ceil(dataCount/limit)
    }
}


// Delete a user
export async function deleteUser(id:string){
    try {
        const data = await prisma.user.findUnique({
            where:{ id }
        });
    
        if(!data) throw new Error("User Not Found");
    
        await prisma.user.delete({
            where:{ id }
        });

        revalidatePath('/admin/users');
    
        return {
            success:true,
            message: "User deleted successfully"
        }
    } catch (error) {
        return {
            success:false,
            message: formatError(error)
        }
    }

}

// Update a user
export async function updateUser(user:z.infer<typeof updateUserSchema>){

    try {
        const data = await prisma.user.findUnique({
            where:{ id: user.id }
        });

        if(!data) throw new Error("User Not Found");
        
        await prisma.user.update({
            where:{ id: user.id },
            data:{
                name: user.name,
                role: user.role,
            }
        })

        return {
            success:true,
            message: "User updated successfully"
        }

        
    } catch (error) {
        return {
            success:false,
            message: formatError(error)

        }
    }

}