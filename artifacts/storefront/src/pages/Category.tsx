import { useParams, Link } from "wouter";
import { useListProducts, getListProductsQueryKey, ProductCategory } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Navbar } from "@/components/layout/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export function Category() {
  const { category } = useParams<{ category: string }>();
  
  const { data: products, isLoading } = useListProducts(
    { category: category as ProductCategory }, 
    { query: { queryKey: getListProductsQueryKey({ category: category as ProductCategory }) } }
  );

  const title = category === 'puja' ? 'Puja Items' : category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-muted-foreground hover:text-foreground text-sm mb-4 inline-block">
            &larr; Back to Home
          </Link>
          <h1 className="font-serif text-3xl font-bold text-primary">{title}</h1>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product, i) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl">
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">We couldn't find any products in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
}
