import { Link, useLocation } from "wouter";
import { Package, ShoppingBag, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminLogout, useGetOrdersSummary, getGetOrdersSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  
  const { data: summary } = useGetOrdersSummary({
    query: {
      queryKey: getGetOrdersSummaryQueryKey(),
      refetchInterval: 30000 // refresh every 30s
    }
  });

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.clear();
        setLocation("/admin/login");
      }
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border shrink-0 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/" className="font-serif text-xl font-bold text-primary">
            Mom's Admin
          </Link>
        </div>
        <nav className="p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          <Link href="/admin/orders">
            <Button 
              variant={location.startsWith("/admin/orders") ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2 relative"
            >
              <ShoppingBag className="h-4 w-4" />
              Orders
              {summary && summary.received > 0 && (
                <span className="absolute right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground px-1">
                  {summary.received}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button 
              variant={location.startsWith("/admin/products") ? "secondary" : "ghost"} 
              className="w-full justify-start gap-2"
            >
              <Package className="h-4 w-4" />
              Products
            </Button>
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t hidden md:block">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
