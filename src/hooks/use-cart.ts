import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import Swal from "sweetalert2"

// Definición de la interfaz del producto
interface Product {
  id: string
  name: string
  description: string
  price: number
  imgUrl?: string
  stock: number
}

// Definición del item en el carrito, que incluye la cantidad
interface CartItem extends Product {
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addToCart: (item: Product) => void
  removeFromCart: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  clearCart: () => void
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === product.id)

        let itemAdded = false;

        if (existingItem) {
          if (existingItem.quantity < product.stock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            })
            itemAdded = true;
          } else {
            Swal.fire({
              icon: "warning",
              title: "Stock insuficiente",
              text: `No hay más stock disponible para ${product.name}.`,
              timer: 2000,
              showConfirmButton: false,
            })
          }
        } else {
          if (product.stock > 0) {
            set({ items: [...currentItems, { ...product, quantity: 1 }] })
            itemAdded = true;
          } else {
            Swal.fire({
              icon: "warning",
              title: "Agotado",
              text: `El producto ${product.name} no está disponible actualmente.`,
              timer: 2000,
              showConfirmButton: false,
            })
          }
        }

        if (itemAdded) {
          Swal.fire({
            icon: 'success',
            title: '¡Añadido!',
            text: `${product.name} se ha añadido al carrito.`,
            timer: 1500,
            showConfirmButton: false,
            position: 'top-end',
          });
        }
      },
      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },
      decreaseQuantity: (productId) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === productId)

        if (existingItem && existingItem.quantity > 1) {
          set({
            items: currentItems.map((item) =>
              item.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
            ),
          })
        } else {
          get().removeFromCart(productId)
        }
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)