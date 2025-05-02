import React, { createContext, useContext, useState } from 'react';

// 🧾 Typage d'un article du panier
export type CartItem = {
  id: number;
  designation: string;
  prix: number;
  quantity: number;
  size: string;
  [key: string]: any; // Permet d'accepter d'autres champs optionnels
};

// 🎯 Typage du contexte
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: number, size: string) => void;
  clearCart: () => void;
};

// ⚠️ Initialisation du contexte avec "null" par défaut
const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    const exists = cartItems.find(
      (item) => item.id === product.id && item.size === product.size
    );

    if (exists) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        )
      );
    } else {
      setCartItems((prev) => [...prev, product]);
    }
  };

  const removeFromCart = (productId: number, size: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size))
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personnalisé pour utiliser le panier
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
