'use server';

import { shippingAddressSchema, signInFormSchema, signUpFormSchema } from "../validators";
import {auth, signIn, signOut} from '@/auth';
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "../prisma";
import { ShippingAddress } from "@/types";
import { formatError } from "../utils";

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