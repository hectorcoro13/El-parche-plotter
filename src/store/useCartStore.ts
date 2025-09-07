import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types/products';
import Swal from 'sweetalert2';
import { useAuthStore } from './useAuthStore';

interface CartItem extends Product { quantity: number; }

interface CartState {
  items: CartItem[];
  isUpdating: boolean; // Para prevenir duplicados
  setCart: (items: CartItem[]) => void;
  fetchCart: () => Promise<void>;
  syncCart: () => Promise<void>;
  addToCart: (product: Product) => Promise<void>;
  decreaseOrRemoveItem: (productId: string) => Promise<void>; // Nueva función para restar/eliminar
  clearCart: (isLogout?: boolean) => Promise<void>;
  getCartCount: () => number;
  getTotalPrice: () => number;
}

const getToken = () => useAuthStore.getState().token;

const mapServerCartItems = (serverItems: any[]): CartItem[] => {
  if (!Array.isArray(serverItems)) return [];
  return serverItems.map(item => ({ ...item, id: item.productId }));
};

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      isUpdating: false, // Estado inicial

      setCart: (items) => set({ items }),

      fetchCart: async () => {
        const token = getToken();
        if (!token) return;
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const serverCart = await response.json();
            set({ items: mapServerCartItems(serverCart.items) });
          } else {
            set({ items: [] });
          }
        } catch (error) { console.error("Error al cargar el carrito:", error); }
      },
      
      syncCart: async () => {
        const token = getToken();
        const localCart = get().items;
        if (!token || localCart.length === 0) {
            // Si no hay carrito local pero si usuario, cargamos el de la DB
            if (token) await get().fetchCart();
            return;
        }

        try {
          await Promise.all(localCart.map(item =>
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                productId: item.id, quantity: item.quantity, name: item.name,
                price: Number(item.price), imgUrl: item.imgUrl || 'No image'
              }),
            })
          ));
          await get().fetchCart();
        } catch (error) { console.error("Error al sincronizar el carrito:", error); }
      },

      addToCart: async (product) => {
        if (get().isUpdating) return; // Previene doble click
        set({ isUpdating: true });

        const token = getToken();
        try {
          if (token) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                productId: product.id, quantity: 1, name: product.name,
                price: Number(product.price), imgUrl: product.imgUrl || 'No image'
              }),
            });
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Error del servidor.');
            }
            const updatedCart = await response.json();
            set({ items: mapServerCartItems(updatedCart.items) });
          } else {
            const currentItems = get().items;
            const existingItem = currentItems.find((item) => item.id === product.id);
            if (existingItem) {
              const updatedItems = currentItems.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              );
              set({ items: updatedItems });
            } else {
              set({ items: [...currentItems, { ...product, quantity: 1 }] });
            }
          }
          Swal.fire({
            title: '¡Añadido!', text: `${product.name} se ha añadido a tu carrito.`,
            icon: 'success', timer: 1500, showConfirmButton: false, background: '#111827', color: '#FFFFFF'
          });
        } catch (error: any) {
          Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#111827', color: '#FFFFFF' });
        } finally {
          set({ isUpdating: false }); // Libera el bloqueo
        }
      },

      // --- FUNCIÓN DE ELIMINAR/DECREMENTAR ACTUALIZADA ---
      decreaseOrRemoveItem: async (productId) => {
        if (get().isUpdating) return;
        set({ isUpdating: true });

        const token = getToken();
        try {
          if (token) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/decrease`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ productId: productId }),
            });
            if (response.ok) {
              const updatedCart = await response.json();
              set({ items: mapServerCartItems(updatedCart.items) });
            }
          } else {
            const currentItems = get().items;
            const itemToDecrease = currentItems.find(item => item.id === productId);
            if (!itemToDecrease) return;

            if (itemToDecrease.quantity > 1) {
              const updatedItems = currentItems.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
              );
              set({ items: updatedItems });
            } else {
              set({ items: currentItems.filter(item => item.id !== productId) });
            }
          }
        } catch (error) {
          console.error("Error al decrementar item:", error);
        } finally {
          set({ isUpdating: false });
        }
      },

      clearCart: async (isLogout = false) => {
        const token = getToken();
        if (token && !isLogout) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/clear`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
          });
        }
        set({ items: [] });
      },

      getCartCount: () => get().items.length,
      getTotalPrice: () => get().items.reduce((total, item) => total + Number(item.price) * item.quantity, 0),
    }),
    { name: 'cart-storage' }
  ),
);