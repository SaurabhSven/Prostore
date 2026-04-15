import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";
import { getLatestProducts, getFeaturedProducts } from "@/lib/actions/product.actions";
import { Product } from "@/types";

const Homepage = async () => {
  const latestProducts:Product[] = await getLatestProducts();
  const featuredProducts:Product[] = await getFeaturedProducts();

  return ( 
  <>
    {
      featuredProducts.length > 0 && (
        <ProductCarousel data={featuredProducts} title="Featured Products"/>
      )
    }
    <ProductList data={latestProducts} title="Newest Arrivals"/>
    <ViewAllProductsButton/>
  </> 
  );
}
 
export default Homepage;