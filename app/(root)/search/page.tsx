import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllCategories, getAllProducts } from "@/lib/actions/product.actions";
import Link from "next/link";

const prices = [
    {
        name: '$1 to $50',
        value: '1-50'
    },
    {
        name: '$51 to $100',
        value: '51-100'
    },
    {
        name: '$101 to $200',
        value: '101-200'
    },
    {
        name: '$201 to $500',
        value: '201-500'
    },
    {
        name: '$501 to $1000',
        value: '501-1000'
    }

];

const ratings = [4,3,2,1];

const sortOrders = ['newest', 'oldest', 'highest', 'lowest', 'rating'];

export async function generateMetadata(){
    return{
        title:'Search Products',
    }
}

const SearchPage = async (props:{
    searchParams:Promise<{
        q?:string,
        category?:string,
        price?:string,
        rating?:string,
        sort?:string,
        page?:string,
    }>
}) => {
    const {
        q="",
        category="all",
        price="all",
        rating="all",
        sort="newest",
        page="1",
    } = await props.searchParams;

    // Contruct filter URL
    const getFilterUrl = ({
        c,
        s,
        p,
        r,
        pg
    }:{
        c?:string,
        s?:string,
        p?:string,
        r?:string,
        pg?:string,
    })=>{
        const params = {q, category, price, rating, sort, page};
        if(c) params.category = c;
        if(s) params.sort = s;
        if(p) params.price = p;
        if(r) params.rating = r;
        if(pg) params.page = pg;

        return `/search?${new URLSearchParams(params as Record<string, string>).toString()}`;
    };
    
    const products = await getAllProducts({
        query:q,
        category,
        price,
        rating,
        sort,
        page:Number(page)
    })

    const categories = await getAllCategories();


    return (
        <div className="grid md:grid-cols-5 md:gap-5">
            <div className="filter-links">
                {/* Category Links */}
                <div className="tex-xl mb-2 mt-3">Department</div>
                <div>
                    <ul className="space-y-1">
                        <li>
                            <Link className={`${(category === 'all' || category === '') && 'font-bold'} `} href={getFilterUrl({c:'all'})}>
                                Any
                            </Link>
                        </li>
                        {
                            categories.map((x)=>(
                                <li key={x.category}>
                                    <Link className={`${category === x.category && 'font-bold'}`} href={getFilterUrl({c:x.category})}>
                                        {x.category}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
                {/* Price Links */}
                <div className="tex-xl mb-2 mt-8">Prices</div>
                <div>
                    <ul className="space-y-1">
                        <li>
                            <Link className={`${(price === 'all' || price === '') && 'font-bold'} `} href={getFilterUrl({p:'all'})}>
                                Any
                            </Link>
                        </li>
                        {
                            prices.map((x)=>(
                                <li key={x.name}>
                                    <Link className={`${price === x.value && 'font-bold'}`} href={getFilterUrl({p:x.value})}>
                                        {x.name}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>

                {/* Rating Links */}
                <div className="tex-xl mb-2 mt-8">Customer Ratings</div>
                <div>
                    <ul className="space-y-1">
                        <li>
                            <Link className={`${(rating === 'all' || rating === '') && 'font-bold'} `} href={getFilterUrl({r:'all'})}>
                                Any
                            </Link>
                        </li>
                        {
                            ratings.map((r)=>(
                                <li key={r}>
                                    <Link className={`${rating === String(r) && 'font-bold'}`} href={getFilterUrl({r:String(r)})}>
                                        {r} Stars & Up
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
            <div className="md:col-span-4 space-y-4">
                <div className="flex-between flex-col md:flex-row my-4">
                    <div className="flex items-center">
                        { q!=='all' && q!=='' && 'Query: '+q}{" "}
                        { category!=='all' && category!=='' && 'Category: '+category}{" "}
                        { price!=='all' && price!=='' && 'Price: '+price}{" "}
                        { rating!=='all' && rating!=='' && 'Rating: '+rating}{" "}
                        {
                            (q!=='all' && q!=='' ) || (category!=='all' && category!=='' ) || (price!=='all' && price!=='' ) || (rating!=='all' && rating!=='') ? (
                                <Button asChild variant={'link'}>
                                    <Link href={'/search'}>Clear Filters</Link>
                                </Button>
                            ):null
                        }
                    </div>
                    {/* Sort */}
                    <div className="flex items-right gap-2">
                        Sort By:{' '} 
                        {
                            sortOrders.map((s)=>(
                                <Link key={s} className={`${sort === s && 'font-bold'}`} href={getFilterUrl({s})}>
                                    {s[0].toUpperCase() + s.slice(1)}
                                </Link>
                            ))
                        }
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {
                        products.data.length === 0 && <div>No Products Found</div>
                    }
                    {
                        products.data.map((product)=>(
                            <ProductCard key={product.id} product={product}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
 
export default SearchPage;