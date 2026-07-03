import { Link } from "wouter";
import { useQueries } from "@tanstack/react-query";
import { getOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderHistoryIds } from "@/lib/orderHistory";
import { PackageSearch, ChevronRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  received: "Order Received",
  packed: "Packed & Ready",
  shipped: "Shipped",
};

export function OrderHistory() {
  const orderIds = getOrderHistoryIds();

  const results = useQueries({
    queries: orderIds.map((id) => ({
      queryKey: getGetOrderQueryKey(id),
      queryFn: () => getOrder(id),
    })),
  });

  const isLoading = results.some((r) => r.isLoading);
  const orders = results
    .map((r) => r.data)
    .filter((order): order is NonNullable<typeof order> => !!order)
    .sort((a, b) => b.id - a.id);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Your Orders</h1>
        <p className="text-muted-foreground mb-8">Track your current order and view your past order history.</p>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        )}

        {!isLoading && orderIds.length === 0 && (
          <div className="bg-background rounded-xl shadow-sm border p-12 text-center">
            <PackageSearch className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">
              Orders you place on this device will show up here.
            </p>
            <Link href="/"><Button>Start Shopping</Button></Link>
          </div>
        )}

        {!isLoading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order.id} href={`/order/${order.id}`}>
                <div className="bg-background rounded-xl shadow-sm border p-6 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-sm bg-muted inline-block px-3 py-1 rounded-md mb-2">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} item{order.items.length !== 1 ? "s" : ""} &middot; ₹
                      {order.total.toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {STATUS_LABELS[order.status] || order.status}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
