"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore"; // <-- Importa el store del carrito
import Swal from "sweetalert2";

export default function AuthCallbackPage() {
  const { login } = useAuthStore();
  const { syncCart } = useCartStore(); // <-- Obtén la función de sincronización
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndSetToken = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth0/profile`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("No se pudo verificar la sesión con el servidor.");
        }

        const data = await response.json();

        // Guardamos el token y los datos del usuario
        await login(data.token);
        
        // --- AÑADIMOS LA SINCRONIZACIÓN DEL CARRITO ---
        await syncCart();

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "¡Bienvenido de nuevo!",
          showConfirmButton: false,
          timer: 2000,
          background: '#111827', color: '#FFFFFF'
        });

        // La redirección al perfil sucederá automáticamente por el "guardián" si es necesario
        // Si no, podemos dejar que vaya al home o al perfil directamente.
        router.push("/perfil");

      } catch (error) {
        console.error("Error en el callback de autenticación:", error);
        Swal.fire({
          icon: "error",
          title: "Error de autenticación",
          text: "Hubo un problema al iniciar tu sesión. Por favor, inténtalo de nuevo.",
          background: '#111827', color: '#FFFFFF'
        });
        router.push("/");
      }
    };

    fetchProfileAndSetToken();
  }, [login, router, syncCart]); // <-- Añade syncCart a las dependencias

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold font-serif">Verificando tu sesión...</h1>
        <p className="mt-2 text-gray-400">Por favor, espera un momento.</p>
      </div>
    </div>
  );
}