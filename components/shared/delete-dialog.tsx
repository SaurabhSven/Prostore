'use client';
import { useState, useTransition } from "react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { toast } from "sonner";

const DeleteDialog = ({ id, action }: { id: string; action: (id: string) => Promise<{ success: boolean; message: string }>; }) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();


    const handleDeleteClick = ()=>{
        startTransition(async()=>{
            const res = await action(id);

            if(!res.success){
                toast.error(res.message)
            }else{
                toast.success(res.message)
            };
            
            setOpen(false);
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button size={'sm'} variant={'destructive'} className="text-white">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        order.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button size={'sm'} variant={'destructive'} className="text-white" disabled={isPending} onClick={handleDeleteClick}>{isPending ? 'Deleting...': 'Delete'}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DeleteDialog;