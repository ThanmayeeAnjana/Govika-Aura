import { useCart } from "@/lib/cart";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Cart() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-background rounded-xl shadow-sm border">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <ShoppingBagIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantLabel}`} className="flex gap-4 p-4 bg-background rounded-xl shadow-sm border">
                  <div className="w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
                    {item.photo ? (
                      <img src={`/api/storage${item.photo}`} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">No img</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground line-clamp-1">{item.productName}</h3>
                        {item.variantLabel && (
                          <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
                        )}
                        <p className="text-primary font-medium mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeFromCart(item.productId, item.variantLabel)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.productId, item.variantLabel, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => updateQuantity(item.productId, item.variantLabel, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-background p-6 rounded-xl shadow-sm border h-fit sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full h-12 text-lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
