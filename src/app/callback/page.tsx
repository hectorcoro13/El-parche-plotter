"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import Swal from "sweetalert2";

export default function AuthCallbackPage() {
  const { login } = useAuthStore();
  // --- CORRECCIÓN AQUÍ ---
  // Obtenemos la nueva función que trae los datos del servidor.
  const { fetchAndSetCart } = useCartStore();
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
        
        // --- CORRECCIÓN CLAVE AQUÍ ---
        // En lugar de enviar el carrito local al servidor (syncCart),
        // traemos el carrito del servidor para que sea la fuente de verdad.
        await fetchAndSetCart();

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "¡Bienvenido de nuevo!",
          showConfirmButton: false,
          timer: 2000,
          background: '#111827', color: '#FFFFFF'
        });

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
    // --- CORRECCIÓN AQUÍ ---
    // Añadimos la nueva función a las dependencias del useEffect.
  }, [login, router, fetchAndSetCart]);

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-black text-white">
      <div className="flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold font-serif">Verificando tu sesión...</h1>
        <p className="mt-2 text-gray-400">Por favor, espera un momento.</p>
      </div>
    </div>
  );
}