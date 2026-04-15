'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

const AdminSearch = () => {

    const searchParams = useSearchParams();

    const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');

    const pathname = usePathname();
    const formActionUrl = pathname.includes('/admin/orders') ? '/admin/orders' : pathname.includes('/admin/users') ? '/admin/users' : '/admin/products';

    useEffect(() => {
        //eslint-disable-next-line react-hooks/exhaustive-deps
        setQueryValue(searchParams.get('query') || '');
    }, [searchParams]);

    return (
        <form action={formActionUrl} method="GET">
            <Input type="search" placeholder="Search .... " name="query" value={queryValue} onChange={e=>setQueryValue(e.target.value)} className="md:w-25 lg:w-75" />
            <Button className="sr-only" type="submit"></Button>
        </form>
    );
}
 
export default AdminSearch;