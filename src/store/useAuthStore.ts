import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { useCartStore } from "./useCartStore";

// --- INTERFAZ CORREGIDA ---
// Se añaden todas las propiedades del usuario que vienen del backend
// para que TypeScript no muestre errores en otras partes de la aplicación.
interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  imageProfile?: string;
  isProfileComplete?: boolean;
  phone?: string | number | null;
  address?: string | null;
  city?: string | null;
  identificationType?: string | null;
  identificationNumber?: string | null;
  order?: any[]; 
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
  updateUserProfile: (newProfileData: Partial<User>) => void;
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
          // Decodificamos solo para obtener el ID, el perfil completo lo traemos del fetch
          const decoded: { id: string } = jwtDecode(token);
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${decoded.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!response.ok) {
            throw new Error('No se pudo obtener el perfil completo del usuario.');
          }
          
          const fullUserProfile: User = await response.json();
          set({ token, user: fullUserProfile, isLoggedIn: true, isAuthLoading: false });

        } catch (error) {
          console.error("Fallo al decodificar el token o al obtener el perfil:", error);
          get().logout(); // Si algo falla, cerramos sesión para evitar un estado inconsistente
        }
      },

      logout: () => {
        // Limpia el carrito y el estado de autenticación
        useCartStore.getState().clearCart();
        set({ token: null, user: null, isLoggedIn: false, isAuthLoading: false });
        // Limpia el almacenamiento local para un logout completo
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('cart-storage');
      },
      
      updateUserProfile: (newProfileData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...newProfileData } : null
        }));
      },

      // Se ejecuta al cargar la aplicación para restaurar la sesión si existe
      init: () => {
        const { token } = get();
        if (token) {
          // Intenta loguear de nuevo con el token existente para refrescar los datos del usuario
          get().login(token).catch(() => {
            console.error("Falló la reinicialización de la sesión. El token puede haber expirado.");
          });
        } else {
          set({ isAuthLoading: false });
        }
      },
    }),
    {
      name: "auth-storage", // Nombre de la clave en localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);