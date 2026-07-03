import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  variantLabel?: string | null;
  photo?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  updateQuantity: (productId: number, variantLabel: string | null | undefined, quantity: number) => void;
  removeFromCart: (productId: number, variantLabel: string | null | undefined) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("moms_storefront_cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("moms_storefront_cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((current) => {
      const existingItemIndex = current.findIndex(
        (item) => item.productId === newItem.productId && item.variantLabel === newItem.variantLabel
      );

      if (existingItemIndex >= 0) {
        const updated = [...current];
        updated[existingItemIndex].quantity += newItem.quantity || 1;
        return updated;
      }

      return [...current, { ...newItem, quantity: newItem.quantity || 1 }];
    });
  };

  const updateQuantity = (productId: number, variantLabel: string | null | undefined, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.variantLabel === variantLabel
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (productId: number, variantLabel: string | null | undefined) => {
    setItems((current) =>
      current.filter((item) => !(item.productId === productId && item.variantLabel === variantLabel))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
