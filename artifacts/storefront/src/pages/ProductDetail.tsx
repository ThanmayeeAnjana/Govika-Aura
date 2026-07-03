import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState as useReactState } from "react";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id || "0", 10);
  
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) }
  });

  const [selectedVariant, setSelectedVariant] = useReactState<string | null>(null);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      toast({
        title: "Please select an option",
        description: "You must select a variant before adding to cart.",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      price: product.price,
      variantLabel: selectedVariant,
      photo: product.photos?.[0]
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Product not found</h2>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/category/${product.category}`} className="text-muted-foreground hover:text-foreground text-sm">
            &larr; Back to {product.category}
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-muted relative">
              {product.photos && product.photos.length > 0 ? (
                <img 
                  src={`/api/storage${product.photos[0]}`} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            {product.photos && product.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.photos.slice(1).map((photo, idx) => (
                  <div key={idx} className="aspect-[3/4] rounded-md overflow-hidden bg-muted">
                    <img 
                      src={`/api/storage${photo}`} 
                      alt={`${product.name} - view ${idx + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8 sticky top-24">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.stockStatus === "made_to_order" ? (
                  <Badge variant="secondary">Made to Order</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">In Stock</Badge>
                )}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                {product.name}
              </h1>
              <p className="text-2xl text-primary font-semibold">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="prose prose-sm md:prose-base text-muted-foreground">
              <p>{product.description}</p>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Select Option</Label>
                <RadioGroup 
                  value={selectedVariant || ""} 
                  onValueChange={setSelectedVariant}
                  className="grid grid-cols-2 gap-3"
                >
                  {product.variants.map((variant, idx) => (
                    <div key={idx}>
                      <RadioGroupItem 
                        value={variant.label} 
                        id={`variant-${idx}`}
                        className="peer sr-only" 
                      />
                      <Label
                        htmlFor={`variant-${idx}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer text-center"
                      >
                        <span className="font-medium">{variant.label}</span>
                        {(variant.size || variant.color) && (
                          <span className="text-xs text-muted-foreground mt-1">
                            {variant.size} {variant.color}
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <Button 
              size="lg" 
              className="w-full text-lg h-14" 
              onClick={handleAddToCart}
              disabled={!product.active}
            >
              {!product.active ? "Unavailable" : "Add to Cart"}
            </Button>
            
            {product.stockStatus === "made_to_order" && (
              <p className="text-sm text-center text-muted-foreground">
                This item is crafted specially for you. Delivery may take 2-3 weeks.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
