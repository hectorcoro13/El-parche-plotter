import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { useCartStore } from "./useCartStore"; // Se importa el store del carrito

// Definición de la interfaz del usuario decodificado del token
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  imageProfile?: string;
  isProfileComplete?: boolean;
}

// Definición del estado y acciones del store de autenticación
interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      isAuthLoading: true,

      login: async (token: string) => {
        try {
          const decoded: User = jwtDecode(token);
          set({ token, user: decoded, isLoggedIn: true, isAuthLoading: false });
        } catch (error) {
          console.error("Fallo al decodificar el token:", error);
          get().logout(); // Si el token es inválido, se limpia la sesión.
        }
      },

      // --- FUNCIÓN DE LOGOUT CORREGIDA ---
      logout: () => {
        // 1. Llama a la acción para limpiar el carrito del store local.
        useCartStore.getState().clearCart();
        
        // 2. Limpia los datos de autenticación del usuario en el estado.
        set({ token: null, user: null, isLoggedIn: false, isAuthLoading: false });
        
        // 3. Se asegura de que el estado persistente también se limpie.
        // Zustand `persist` se encarga de esto al hacer set, pero una limpieza manual es más segura.
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('cart-storage'); // Limpiamos también el carrito por si acaso
      },

      init: () => {
        const { token } = get();
        if (token) {
          try {
            const decoded: User = jwtDecode(token);
            // Comprobamos si el token ha expirado
            if (Date.now() >= (decoded as any).exp * 1000) {
              throw new Error("Token expirado");
            }
            set({ user: decoded, isLoggedIn: true, isAuthLoading: false });
          } catch (error) {
            console.error("Error en inicialización de Auth:", error);
            get().logout(); // Si hay cualquier problema con el token, se cierra la sesión.
          }
        } else {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // Nombre para el almacenamiento local
      storage: createJSONStorage(() => localStorage),
    }
  )
);