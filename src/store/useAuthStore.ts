import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { useCartStore } from "./useCartStore";

// Definición de la interfaz del usuario
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  imageProfile?: string;
  isProfileComplete?: boolean;
  // Añadimos las otras propiedades que vienen de la base de datos
  phone?: string | number | null;
  address?: string | null;
  city?: string | null;
}

// Definición del estado y acciones del store
interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isAuthLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  init: () => void;
  updateUserProfile: (newProfileData: Partial<User>) => void; // <-- 1. AÑADIMOS LA FUNCIÓN A LA INTERFAZ
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
          // Hacemos una petición al backend para obtener el perfil completo
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${decoded.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('No se pudo obtener el perfil completo del usuario.');
          
          const fullUserProfile = await response.json();
          set({ token, user: fullUserProfile, isLoggedIn: true, isAuthLoading: false });

        } catch (error) {
          console.error("Fallo al decodificar el token o al obtener el perfil:", error);
          get().logout();
        }
      },

      logout: () => {
        useCartStore.getState().clearCart();
        set({ token: null, user: null, isLoggedIn: false, isAuthLoading: false });
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('cart-storage');
      },
      
      // --- 2. AÑADIMOS LA IMPLEMENTACIÓN DE LA FUNCIÓN ---
      updateUserProfile: (newProfileData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...newProfileData } : null
        }));
      },

      init: () => {
        // La función init ahora llama a login para asegurar que siempre tengamos el perfil completo
        const { token } = get();
        if (token) {
          get().login(token).catch(() => {
             // Si el login falla (ej. token expirado), el logout se maneja dentro de login()
            console.error("Falló la reinicialización de la sesión.");
          });
        } else {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);