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

// Definición del estado y acciones del store del carrito
interface CartStore {
  items: CartItem[]
  addToCart: (item: Product) => void
  removeFromCart: (productId: string) => void
  decreaseQuantity: (productId: string) => void
  clearCart: () => void
}

// Creación del hook 'useCart' con Zustand
export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      // Acción para añadir un producto al carrito
      addToCart: (product) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === product.id)

        // Si el producto ya está en el carrito
        if (existingItem) {
          if (existingItem.quantity < product.stock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            })
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
          // Si el producto no está en el carrito
          if (product.stock > 0) {
            set({ items: [...currentItems, { ...product, quantity: 1 }] })
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
      },
      // Acción para eliminar un producto del carrito
      removeFromCart: (productId) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },
      // Acción para decrementar la cantidad de un producto
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
          // Si la cantidad es 1, se elimina del carrito
          get().removeFromCart(productId)
        }
      },
      // Acción para vaciar el carrito
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // Nombre para el almacenamiento local
      storage: createJSONStorage(() => localStorage), // Usar localStorage para persistencia
    },
  ),
)