'use client';

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validators";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";
import slugify from "slugify";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";

const ProductForm = ({ type, product, productId }: { type: 'Create' | 'Update', product?: Product, productId?: string }) => {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(type === 'Update' ? updateProductSchema : insertProductSchema),
        defaultValues: type === 'Update' ? product : productDefaultValues
    })

    const onSubmit:SubmitHandler<z.infer<typeof insertProductSchema> | z.infer<typeof updateProductSchema>> = async (values) => {
        // On Create
        if(type === 'Create'){
            const res = await createProduct(values);

            if(res.success){
                toast.success(res.message);
            }else{
                toast.error(res.message);
            }
            router.push('/admin/products');
        }

        // On Update
        if(type === 'Update'){
            if(!productId){
                toast.error("Product ID is required for update");
                router.push('/admin/products');
                return;
            }
            const res = await updateProduct({...values, id: productId});

            if(res.success){
                toast.success(res.message);
            }else{
                toast.error(res.message);
            }
            router.push('/admin/products');
        }
    }

    const images = form.watch('images');
    const isFeatured = form.watch('isFeatured');
    const banner = form.watch('banner');

    return (
        <form method="POST" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col md:flex-row gap-5">
                {/* Name */}
                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="name">
                                Product Name
                            </FieldLabel>
                            <Input
                                {...field}
                                id="name"
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter Product Name"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                {/* Slug */}
                <Controller
                    name="slug"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="slug">
                                Slug
                            </FieldLabel>
                            <div className="relative">
                                <Input
                                    {...field}
                                    id="slug"
                                    aria-invalid={fieldState.invalid}
                                    autoComplete="off"
                                    readOnly
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                                <Button type="button" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2" onClick={()=>{
                                    form.setValue('slug', slugify(form.getValues('name'), {lower:true, strict:true}))
                                }}>Generate</Button>
                            </div>
                        </Field>
                    )}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                {/* Category */}
                <Controller
                    name="category"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="category">
                                Category
                            </FieldLabel>
                            <Input
                                {...field}
                                id="category"
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter Category"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                {/* Brand */}
                <Controller
                    name="brand"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="brand">
                                Brand
                            </FieldLabel>
                            <Input
                                {...field}
                                id="brand"
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter Brand"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                {/* Price */}
                <Controller
                    name="price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="price">
                                Price
                            </FieldLabel>
                            <Input
                                {...field}
                                id="price"
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter Product Price"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
                {/* Stock */}
                <Controller
                    name="stock"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="stock">
                                Stock
                            </FieldLabel>
                            <Input
                                {...field}
                                id="stock"
                                aria-invalid={fieldState.invalid}
                                placeholder="Enter Stock Quantity"
                                autoComplete="off"
                            />
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </div>

            <div className="upload-field flex flex-col md:flex-row gap-5">
                {/* Image Upload */}
                <Controller
                    name="images"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="images">
                                Images
                            </FieldLabel>
                            <Card>
                                <CardContent className="space-y-2 mt-2 min-h-48">
                                    <div className="flex-start space-x-2">
                                        {
                                            images && images.length > 0 ? images.map((image:string)=>(
                                                <Image key={image} src={image} alt="Product Image" width={100} height={100} className="w-20 h-20 object-cover object-center rounded"/>
                                            )):''
                                        }
                                        <UploadButton 
                                            endpoint="imageUploader" 
                                            onClientUploadComplete={(res:{url:string}[])=>{form.setValue('images', [...images, res[0].url])}} 
                                            onUploadError={(error:Error)=>{toast.error(error.message)}}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                            
                        </Field>
                    )}
                />
            </div>
            <div className="upload-field">
                {/* isFeatured*/}
                Featured Product:
                <Card>
                    <CardContent className="space-y-2 mt-2">
                        <Controller
                            name="isFeatured"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="isFeatured" checked={field.value} onCheckedChange={field.onChange} />
                                        <FieldLabel htmlFor="isFeatured">
                                            Featured
                                        </FieldLabel>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                    {
                                        isFeatured && banner && (
                                            <Image src={banner} alt="Banner Image" width={1920} height={680} className="w-full object-cover object-center rounded-sm" />
                                        )
                                    }

                                    {
                                        isFeatured && banner && (
                                            <UploadButton 
                                                endpoint="imageUploader" 
                                                onClientUploadComplete={(res:{url:string}[])=>{form.setValue('banner', res[0].url)}} 
                                                onUploadError={(error:Error)=>{toast.error(error.message)}}
                                            />
                                        )
                                    }
                                </Field>
                            )}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-5">
                {/* Description */}
                <Controller
                    name="description"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="description">
                                Description
                            </FieldLabel>
                            <Textarea {...field} aria-invalid={fieldState.invalid} id="description" placeholder="Enter Product Description" className="resize-none"/>
                            {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                            )}
                        </Field>
                    )}
                />
            </div>
            
            <div className="flex gap-2">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                        'Submitting...'
                    ):(
                        `${type} Product`
                    )}
                </Button>
            </div>
        </form>
    );
}

export default ProductForm;