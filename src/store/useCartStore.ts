import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Swal from "sweetalert2";
import { useAuthStore } from "./useAuthStore";

// Interfaces para tipado
interface Product {
  id: string;
  name: string;
  price: number | string;
  description: string;
  stock: number;
  imgUrl?: string;
  category: { id: string; name: string };
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  fetchAndSetCart: () => Promise<void>;
  getTotalPrice: () => number; // <-- 1. AÑADIR EL TIPO DE LA FUNCIÓN
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // --- 2. AÑADIR LA IMPLEMENTACIÓN DE LA FUNCIÓN ---
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
      },

      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);
        let itemAdded = false;

        if (existingItem) {
          if (existingItem.quantity < product.stock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            });
            itemAdded = true;
          } else {
            Swal.fire({
              icon: "warning", title: "Stock insuficiente",
              text: `No hay más stock disponible para ${product.name}.`,
              timer: 2000, showConfirmButton: false, background: '#111827', color: '#FFFFFF'
            });
          }
        } else {
          if (product.stock > 0) {
            set({ items: [...currentItems, { ...product, quantity: 1 }] });
            itemAdded = true;
          } else {
             Swal.fire({
              icon: "error", title: "Agotado", text: `El producto ${product.name} no está disponible.`,
              timer: 2000, showConfirmButton: false, background: '#111827', color: '#FFFFFF'
            });
          }
        }

        if (itemAdded) {
          const Toast = Swal.mixin({
            toast: true, position: 'top-end', showConfirmButton: false, timer: 2000,
            timerProgressBar: true, background: '#111827', color: '#FFFFFF',
          });
          Toast.fire({ icon: 'success', title: '¡Producto añadido al carrito!' });
        }
        get().syncCart();
      },
      
      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
        get().syncCart();
      },

      decreaseQuantity: (productId) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === productId);

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            ),
          });
        } else {
          set({ items: currentItems.filter((item) => item.id !== productId) });
        }
        get().syncCart();
      },

      clearCart: () => {
        set({ items: [] });
      },
      
      fetchAndSetCart: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('No se pudo obtener el carrito del servidor.');
          
          const serverCart = await response.json();
          set({ items: serverCart.items || [] }); 
        } catch (error) {
          console.error("Error al obtener el carrito:", error);
        }
      },

      syncCart: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return;

        const items = get().items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: Number(item.price),
          imgUrl: item.imgUrl || 'No image'
        }));
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/sync`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ items }),
          });
        } catch (error) {
          console.error("Error al sincronizar el carrito con el backend:", error);
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);