import { Link } from "wouter";
import { Product } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`}>
      <Card className="group overflow-hidden border-none shadow-sm hover-elevate transition-all cursor-pointer bg-transparent">
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <AspectRatio ratio={3/4}>
            {product.photos && product.photos.length > 0 ? (
              <img 
                src={`/api/storage${product.photos[0]}`} 
                alt={product.name} 
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                No image
              </div>
            )}
          </AspectRatio>
          {product.stockStatus === "made_to_order" && (
            <Badge className="absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur-sm hover:bg-background/90 font-medium border-none shadow-sm">
              Made to Order
            </Badge>
          )}
          {!product.active && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-[2px]">
              <Badge variant="destructive" className="text-sm shadow-md">Currently Unavailable</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <div className="space-y-1">
            <h3 className="font-medium text-base truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-primary font-semibold">
              ₹{product.price.toLocaleString("en-IN")}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
