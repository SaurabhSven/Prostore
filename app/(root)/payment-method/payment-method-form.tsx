'use client';

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/cart.actions";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { paymentMethodSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PaymentMethodForm = ({preferedPaymentMethod}:{preferedPaymentMethod:string|null}) => {
    const router = useRouter();
    const [isPending, startTransition ] = useTransition();

    const form = useForm<z.infer<typeof paymentMethodSchema>>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {type:preferedPaymentMethod || DEFAULT_PAYMENT_METHOD},
    });

    function onSubmit(data: z.infer<typeof paymentMethodSchema>) {
        startTransition(async ()=>{
          const res = await updateUserPaymentMethod(data);
    
          if(res.success){
            toast.success(res.message);
            router.push("/place-order");
          }else{
            toast.error(res.message);
          }    
    
        })
      }

    
    return (
        <>
            <div className="max-w-md mx-auto space-y-4">
                <h1 className="h2-bold mt-4">Payment Method</h1>
                <p className="text-sm text-muted-foreground">
                Please enter a payment method
                </p>
                <form method="POST" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col md:flex-row gap-5">
                    <Controller
                        name="type"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <FieldSet>
                                <RadioGroup
                                    name={field.name}
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    // className="flex flex-col space-y-2"
                                >
                                    {PAYMENT_METHODS.map((paymentMethod) => (
                                    <FieldLabel key={paymentMethod} htmlFor={`form-rhf-radiogroup-${paymentMethod}`}>
                                        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                                            <RadioGroupItem
                                                value={paymentMethod}
                                                id={`form-rhf-radiogroup-${paymentMethod}`}
                                                aria-invalid={fieldState.invalid}
                                            />
                                            <FieldContent>
                                                <FieldTitle>{paymentMethod}</FieldTitle>
                                            </FieldContent>
                                        </Field>
                                    </FieldLabel>
                                    ))}
                                </RadioGroup>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </FieldSet>
                        )}
                        />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={isPending}>
                    {isPending? (
                        <Loader className="w-4 h-4 animate-spin"/>
                    ):(
                        <ArrowRight className="w-4 h-4 "/> 
                    )} Continue
                    </Button>
                </div>
                </form>
            </div>
        </>
    );
}
 
export default PaymentMethodForm;