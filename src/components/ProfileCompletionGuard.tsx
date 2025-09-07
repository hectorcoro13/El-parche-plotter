"use client";

import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";

export function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isAuthLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // No hacemos nada si está cargando, si no está logueado, o si el perfil ya está completo.
    if (isAuthLoading || !isLoggedIn || user?.isProfileComplete) {
      return;
    }
  
    // Si el perfil está incompleto y NO estamos en la página de perfil, redirigimos.
    if (user && !user.isProfileComplete && pathname !== '/perfil') {
      
      // Usamos una alerta para notificar al usuario POR QUÉ lo estamos redirigiendo.
      Swal.fire({
          title: 'Perfil Incompleto',
          text: "Para continuar, por favor completa tu información de contacto y dirección.",
          icon: 'info',
          confirmButtonText: 'Entendido',
          background: '#111827',
          color: '#FFFFFF'
      }).then(() => {
          router.push('/perfil');
      });
    }
  
  }, [isLoggedIn, user, isAuthLoading, pathname, router]);
  
  return <>{children}</>;
}