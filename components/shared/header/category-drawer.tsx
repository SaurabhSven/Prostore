import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { getAllCategories } from "@/lib/actions/product.actions";
import { Menu } from "lucide-react";
import Link from "next/link";

const CategoryDrawer = async () => {

    const categories = await getAllCategories();

    return (
        <Drawer direction="left">
            <DrawerTrigger asChild>
                <Button variant="outline">
                    <Menu/>
                </Button>
            </DrawerTrigger>
            <DrawerContent className="h-full max-w-sm ">
                <DrawerHeader>
                    <DrawerTitle>Categories</DrawerTitle>
                    {/* <DrawerDescription id="Categories">This is Categories</DrawerDescription> */}
                    <div className="space-y-1 mt-4">
                        {
                            categories.map((x)=>(
                                <Button key={x.category} variant={'ghost'} className="w-full justify-start" asChild>
                                    <DrawerClose>
                                        <Link href={`/search?category=${x.category}`}>
                                            {x.category} ({x._count})
                                        </Link>
                                    </DrawerClose>
                                </Button>
                            ))
                        }
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    );
}

export default CategoryDrawer;