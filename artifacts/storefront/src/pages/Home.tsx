import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/layout/Navbar";
import { Link } from "wouter";

export function Home() {
  const { data: products, isLoading } = useListProducts(
    {}, 
    { query: { queryKey: getListProductsQueryKey({}) } }
  );

  const categories = [
    { id: "saree", name: "Sarees", color: "bg-red-50 text-red-800 border-red-100" },
    { id: "kurti", name: "Kurtis", color: "bg-orange-50 text-orange-800 border-orange-100" },
    { id: "puja", name: "Puja Items", color: "bg-yellow-50 text-yellow-800 border-yellow-100" },
    { id: "decor", name: "Home Decor", color: "bg-emerald-50 text-emerald-800 border-emerald-100" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary/5 py-12 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight">
              Handpicked with love, delivered to your home.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-8">
              Explore our curated collection of authentic sarees, elegant kurtis, and festive home decor.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="font-serif text-2xl font-bold mb-6 text-center">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/category/${cat.id}`}>
                  <div className={`p-6 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105 ${cat.color}`}>
                    <span className="font-medium text-lg">{cat.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-3xl font-bold">New Arrivals</h2>
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
              {products.slice(0, 8).map((product, i) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">No products available yet.</p>
            </div>
          )}
        </section>
      </main>
      
      <footer className="bg-card py-12 border-t mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-serif text-xl font-bold text-primary mb-4">Mom's Storefront</p>
          <p className="text-muted-foreground text-sm">Authentic Indian fashion & decor.</p>
        </div>
      </footer>
    </div>
  );
}
