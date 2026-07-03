import { useParams, Link } from "wouter";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Package, Truck, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || "0", 10);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: getGetOrderQueryKey(orderId) }
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
          <Skeleton className="h-40 w-full rounded-xl mb-8" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Order not found</h2>
            <Link href="/"><Button>Return to Home</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  const getStatusStep = () => {
    switch (order.status) {
      case "received": return 1;
      case "packed": return 2;
      case "shipped": return 3;
      default: return 1;
    }
  };

  const step = getStatusStep();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-background rounded-xl shadow-sm border p-8 mb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">Thank you for your purchase, {order.customerName}.</p>
          <p className="font-mono text-sm bg-muted inline-block px-3 py-1 rounded-md">Order #{order.id}</p>
          
          {order.paymentMethod === "upi" && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg text-primary text-sm max-w-md mx-auto">
              <strong>Action Required:</strong> You chose UPI payment. We will contact you shortly on WhatsApp ({order.phone}) to share the payment QR code and complete your order.
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="bg-background rounded-xl shadow-sm border p-6 md:p-8 mb-8">
          <h2 className="font-serif text-xl font-bold mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Track Line */}
            <div className="absolute left-[27px] top-10 bottom-10 w-0.5 bg-muted"></div>
            <div className="absolute left-[27px] top-10 w-0.5 bg-primary transition-all" style={{ height: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

            <div className="space-y-8 relative">
              {/* Step 1 */}
              <div className="flex gap-6">
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div className="pt-3">
                  <h3 className="font-bold text-lg">Order Received</h3>
                  <p className="text-muted-foreground">We've received your order and will start preparing it soon.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6">
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div className="pt-3">
                  <h3 className="font-bold text-lg">Packed & Ready</h3>
                  <p className="text-muted-foreground">Your items are packed securely and awaiting dispatch.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6">
                <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center z-10 border-4 border-background ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div className="pt-3">
                  <h3 className="font-bold text-lg">Shipped</h3>
                  <p className="text-muted-foreground">Your order is on its way!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-background rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="font-serif text-xl font-bold mb-6">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <div>
                  <span className="font-medium">{item.productName}</span>
                  {item.variantLabel && <span className="text-muted-foreground block">{item.variantLabel}</span>}
                  <span className="text-muted-foreground block">Qty: {item.quantity}</span>
                </div>
                <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span>₹{order.deliveryFee.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-foreground mt-4 pt-4 border-t">
              <span>Total</span>
              <span>₹{order.total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-muted-foreground">Delivery Address</h4>
              <p className="font-medium">{order.customerName}</p>
              <p>{order.phone}</p>
              <p className="whitespace-pre-wrap">{order.address}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-muted-foreground">Payment Method</h4>
              <p className="font-medium capitalize">{order.paymentMethod === 'upi' ? 'UPI' : 'Cash on Delivery'}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
