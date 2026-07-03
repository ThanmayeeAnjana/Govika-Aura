import { useListOrders, getListOrdersQueryKey, useUpdateOrderStatus, OrderStatus } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Check, Truck, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function AdminOrders() {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const queryClient = useQueryClient();
  
  const { data: orders, isLoading } = useListOrders(
    filter !== "all" ? { status: filter } : {},
    { query: { queryKey: getListOrdersQueryKey(filter !== "all" ? { status: filter } : {}), refetchInterval: 15000 } }
  );

  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (id: number, status: OrderStatus) => {
    updateStatus.mutate(
      { id, data: { status } },
      { 
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey({}) });
          queryClient.invalidateQueries({ queryKey: ["/api/orders/summary"] }); // Refetch summary
        }
      }
    );
  };

  const StatusBadge = ({ status }: { status: OrderStatus }) => {
    switch (status) {
      case "received": return <Badge className="bg-destructive hover:bg-destructive/90 animate-pulse">New / Received</Badge>;
      case "packed": return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Packed</Badge>;
      case "shipped": return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Shipped</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Track and manage customer orders.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="received">Received (New)</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background rounded-xl p-6 border shadow-sm space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/4 ml-auto" />
            </div>
          ))
        ) : orders && orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className={`bg-background rounded-xl p-6 border shadow-sm transition-all ${order.status === 'received' ? 'ring-2 ring-destructive/20 border-destructive/30' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm bg-muted px-2 py-1 rounded">#{order.id}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{order.customerName}</h3>
                  <p className="text-muted-foreground text-sm">{order.phone} • {order.paymentMethod.toUpperCase()}</p>
                </div>
                
                <div className="text-left md:text-right">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-bold text-xl text-primary">₹{order.total.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 mb-6 text-sm">
                <p className="font-medium mb-2">Delivery Address:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">{order.address}</p>
              </div>

              <div className="mb-6">
                <p className="font-medium mb-3 text-sm">Order Items:</p>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-2 border-b last:border-0 border-border/50">
                      <div className="flex gap-2">
                        <span className="font-medium">{item.quantity}x</span>
                        <span>{item.productName} {item.variantLabel ? `(${item.variantLabel})` : ''}</span>
                      </div>
                      <span className="text-muted-foreground">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end pt-4 border-t">
                {order.paymentMethod === 'upi' && (
                  <Button variant="outline" size="sm" className="mr-auto gap-2" asChild>
                    <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=Hi%20${order.customerName},%20this%20is%20Mom's%20Storefront.%20Your%20order%20%23${order.id}%20is%20confirmed!%20Please%20complete%20the%20UPI%20payment%20of%20Rs.${order.total}%20to%20proceed.`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      Message on WhatsApp
                    </a>
                  </Button>
                )}

                {order.status === 'received' && (
                  <Button size="sm" className="gap-2" onClick={() => handleStatusChange(order.id, 'packed')}>
                    <Package className="w-4 h-4" />
                    Mark as Packed
                  </Button>
                )}
                {order.status === 'packed' && (
                  <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleStatusChange(order.id, 'shipped')}>
                    <Truck className="w-4 h-4" />
                    Mark as Shipped
                  </Button>
                )}
                {order.status === 'shipped' && (
                  <Button size="sm" variant="secondary" disabled className="gap-2">
                    <Check className="w-4 h-4" />
                    Shipped
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-xl border-dashed border-2">
            <p className="text-muted-foreground">No orders found.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
