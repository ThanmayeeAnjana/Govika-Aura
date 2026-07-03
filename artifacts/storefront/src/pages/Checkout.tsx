import { useCart } from "@/lib/cart";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCreateOrder, PaymentMethod } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");

  if (items.length === 0) {
    setLocation("/cart");
    return null;
  }

  const deliveryFee = 50; // Fixed flat fee for simplicity
  const total = cartTotal + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address) {
      toast({ title: "Please fill all details", variant: "destructive" });
      return;
    }

    createOrder.mutate(
      {
        data: {
          customerName: formData.name,
          phone: formData.phone,
          address: formData.address,
          paymentMethod,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantLabel: item.variantLabel,
          }))
        }
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order/${order.id}`);
        },
        onError: () => {
          toast({ title: "Failed to place order", variant: "destructive" });
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted/20">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid md:grid-cols-[1fr_380px] gap-8">
          <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
            <div className="bg-background p-6 rounded-xl shadow-sm border space-y-6">
              <h2 className="font-serif text-xl font-bold">Delivery Details</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Jane Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                  <Input 
                    id="phone" 
                    placeholder="+91 98765 43210" 
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    required 
                  />
                  <p className="text-xs text-muted-foreground">We will use this to contact you regarding payment & delivery.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Delivery Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="House/Flat No, Street, Landmark, City, Pincode" 
                    rows={4}
                    value={formData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    required 
                  />
                </div>
              </div>
            </div>

            <div className="bg-background p-6 rounded-xl shadow-sm border space-y-6">
              <h2 className="font-serif text-xl font-bold">Payment Method</h2>
              
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="space-y-3">
                <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer">
                    <div className="font-medium">UPI Payment (GPay, PhonePe, Paytm)</div>
                    <div className="text-sm text-muted-foreground">Seller will share QR code/number on WhatsApp after order is placed.</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 border p-4 rounded-lg cursor-pointer hover:bg-muted/50">
                  <RadioGroupItem value="cod" id="cod" />
                  <Label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay when your order arrives.</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </form>

          <div className="space-y-6">
            <div className="bg-background p-6 rounded-xl shadow-sm border sticky top-24">
              <h2 className="font-serif text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantLabel}`} className="flex justify-between text-sm">
                    <div className="flex-1 pr-4">
                      <span className="font-medium">{item.productName}</span>
                      {item.variantLabel && <span className="text-muted-foreground block">{item.variantLabel}</span>}
                      <span className="text-muted-foreground">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>₹{deliveryFee}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form" 
                size="lg" 
                className="w-full h-14 text-lg"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
