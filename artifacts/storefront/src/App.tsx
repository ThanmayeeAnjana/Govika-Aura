import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart";

// Pages
import { Home } from "@/pages/Home";
import { Category } from "@/pages/Category";
import { ProductDetail } from "@/pages/ProductDetail";
import { Cart } from "@/pages/Cart";
import { Checkout } from "@/pages/Checkout";
import { OrderTracking } from "@/pages/OrderTracking";
import { OrderHistory } from "@/pages/OrderHistory";
import NotFound from "@/pages/not-found";

// Admin
import { AdminLogin } from "@/pages/admin/Login";
import { AdminProducts } from "@/pages/admin/Products";
import { AdminOrders } from "@/pages/admin/Orders";
import { AdminRoute } from "@/components/layout/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/category/:category" component={Category} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={OrderHistory} />
      <Route path="/order/:id" component={OrderTracking} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/products">
        {() => (
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        )}
      </Route>
      <Route path="/admin/orders">
        {() => (
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
