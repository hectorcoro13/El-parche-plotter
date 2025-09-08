import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Swal from "sweetalert2";
import { useAuthStore } from "../store/useAuthStore";

// Interfaces para un tipado estricto
interface Product {
  id: string;
  name: string;
  price: number | string;
  description: string;
  stock: number;
  imgUrl?: string;
  category?: { id: string; name: string };
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
}

// Estilos consistentes para todas las alertas de la aplicación
const swalBaseOptions = {
  background: '#111827',
  color: '#FFFFFF',
  confirmButtonColor: '#DC2626',
  cancelButtonColor: '#4B5563',
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
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
              ...swalBaseOptions,
              icon: "warning",
              title: "Stock insuficiente",
              text: `No hay más stock disponible para ${product.name}.`,
              timer: 2500,
              showConfirmButton: false,
            });
          }
        } else {
          if (product.stock > 0) {
            set({ items: [...currentItems, { ...product, quantity: 1 }] });
            itemAdded = true;
          } else {
             Swal.fire({
              ...swalBaseOptions,
              icon: "error",
              title: "Agotado",
              text: `El producto ${product.name} no está disponible actualmente.`,
              timer: 2500,
              showConfirmButton: false,
            });
          }
        }

        if (itemAdded) {
          // Alerta central, estilizada y que se cierra sola.
          Swal.fire({
            ...swalBaseOptions,
            icon: 'success',
            title: '¡Producto añadido!',
            text: `${product.name} se ha añadido a tu carrito.`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
        
        // Sincroniza con el backend después de cada modificación.
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
          // Si la cantidad es 1, se elimina del carrito.
          set({ items: currentItems.filter((item) => item.id !== productId) });
        }
        get().syncCart();
      },

      clearCart: () => {
        set({ items: [] });
        // No llamamos a syncCart aquí porque esta acción es para limpiar el estado local,
        // principalmente durante el logout.
      },

      syncCart: async () => {
        const { token } = useAuthStore.getState();
        if (!token) return; // No se sincroniza si el usuario no está logueado.

        const itemsToSync = get().items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        }));
        
        try {
          // Endpoint hipotético para sincronizar. Asegúrate de que exista en tu backend.
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ items: itemsToSync }),
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