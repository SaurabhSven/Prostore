import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

const currency = z
    .string()
    .refine((value)=>/^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), "Price must have exaclty two decimal places")

//  Schema for inserting a product
export const insertProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    slug: z.string().min(3, 'Slug must be at least 3 characters long'),
    category: z.string().min(3, 'Category must be at least 3 characters long'),
    brand: z.string().min(3, 'Brand must be at least 3 characters long'),
    description: z.string().min(3, 'Description must be at least 3 characters long'),
    stock: z.coerce.number().min(0, 'Stock cannot be negative'),
    images: z.array(z.string()).min(1, 'Product have at least one image'),
    isFeatured: z.boolean(),
    banner: z.string().nullable(),
    price: currency,
    numReviews: z.coerce.number().nullable()
});

// Sign In Form Schema
export const signInFormSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

// Signing Up Form Schema
export const signUpFormSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
}).refine((data)=> data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});