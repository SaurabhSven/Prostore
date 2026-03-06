import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

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

// Cart Schemas

export const cartItemSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    qty: z.number().int().nonnegative('Quantity must be a positive number'),
    image: z.string().min(1, 'Image is required'),
    price: currency,
});

export const insertCartSchema = z.object({
    items: z.array(cartItemSchema),
    itemsPrice: currency,
    totalPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    sessionCartId:z.string().min(1, 'Session Cart ID is required'),
    userId: z.string().optional().nullable()
});

// Schema for shipping address
export const shippingAddressSchema = z.object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
    city: z.string().min(3, 'City must be at least 3 characters'),
    postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
    country: z.string().min(3, 'Country must be at least 3 characters'),
    lat: z.number().optional(),
    lng: z.number().optional(),
});

// Schema for payment methood
export const paymentMethodSchema = z.object({
    type: z.string().min(1, 'Payment method is required'),
}).refine((data)=>PAYMENT_METHODS.includes(data.type),{
    path:['type'],
    error:'Invalid payment method',
});

// Schema for inserting order
export const insertOrderSchema = z.object({
    userId: z.string().min(1, 'User is required'),
    itemsPrice: currency,
    shippingPrice: currency,
    taxPrice: currency,
    totalPrice: currency,
    paymentMethod: z.string().refine((data)=>PAYMENT_METHODS.includes(data), {
        error:'Invalid payment method'
    }),
    shippingAddress: shippingAddressSchema
});


// Schema for inserting an order item
export const insertOrderItemSchema = z.object({
    productId:z.string(),
    slug:z.string(),
    image:z.string(),
    name:z.string(),
    price: currency,
    qty:z.number()
});

export const paymentResultSchema = z.object({
    id:z.string(),
    status:z.string(),
    email_address:z.string(),
    pricePaid:z.string(),
})