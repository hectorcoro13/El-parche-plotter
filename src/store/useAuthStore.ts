import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { useCartStore } from './useCartStore';

interface User {
  id: string; name: string; email: string; phone: number | string | null; address: string | null;
  city: string | null; order: any[]; imageProfile?: string | null; isAdmin: boolean;
}

interface AuthState {
  token: string | null; user: User | null; isLoggedIn: boolean; isAuthLoading: boolean;
  login: (token: string) => Promise<void>; logout: () => void;
  updateUserProfile: (updatedUser: Partial<User>) => void; init: () => Promise<void>;
}

interface DecodedToken { id: string; email: string; }

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null, user: null, isLoggedIn: false, isAuthLoading: true,

      login: async (token: string) => {
        try {
          const decodedToken = jwtDecode<DecodedToken>(token);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${decodedToken.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('No se pudo obtener la información del usuario.');
          const userData = await response.json();
          // Solo actualizamos el estado del usuario, sin tocar el carrito aún.
          set({ user: userData, token, isLoggedIn: true });
        } catch (error) {
          console.error("Fallo el inicio de sesión en el store:", error);
          get().logout();
        }
      },

      logout: () => {
        set({ user: null, token: null, isLoggedIn: false });
        useCartStore.getState().clearCart(true); 
      },
      
      updateUserProfile: (updatedUser: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null
        }));
      },

      init: async () => {
        set({ isAuthLoading: true });
        const token = get().token;
        if (token) {
          await get().login(token);
          // Después de la carga inicial, SÍ cargamos el carrito
          await useCartStore.getState().fetchCart();
        }
        set({ isAuthLoading: false });
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ token: state.token }) }
  )
);