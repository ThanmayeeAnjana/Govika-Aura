import { Link } from "wouter";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-primary hidden sm:inline-block">
              Mom's Storefront
            </span>
            <span className="font-serif text-xl font-bold text-primary sm:hidden">
              Mom's
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 font-medium text-sm">
          <Link href="/category/saree" className="transition-colors hover:text-primary">Sarees</Link>
          <Link href="/category/kurti" className="transition-colors hover:text-primary">Kurtis</Link>
          <Link href="/category/puja" className="transition-colors hover:text-primary">Puja Items</Link>
          <Link href="/category/decor" className="transition-colors hover:text-primary">Decor</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/orders" className="hidden sm:block">
            <Button variant="ghost" size="icon" title="Your Orders">
              <User className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 -translate-y-1/2 translate-x-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
