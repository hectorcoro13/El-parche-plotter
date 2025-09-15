"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useRouter } from "next/navigation";
import { MercadoPagoButton } from "../../components/MercadoPagoButton";
import Link from "next/link"; // Importa Link

export default function CheckoutPage() {
  const { isLoggedIn, user, isAuthLoading } = useAuthStore();
  const { items, getTotalPrice } = useCartStore();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Proteger la ruta: si no está logueado o el carrito está vacío, lo redirigimos
    if (hasMounted && !isAuthLoading) {
      if (!isLoggedIn) {
        router.push("/carrito");
      }
      if (items.length === 0) {
        router.push("/productos");
      }
    }
  }, [isLoggedIn, items, isAuthLoading, hasMounted, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency", currency: "COP", maximumFractionDigits: 0
    }).format(price);
  };

  // Muestra un estado de carga mientras se verifica la sesión o se monta el componente
  if (!hasMounted || isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <p>Cargando checkout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold font-serif mb-8 text-center">Finalizar Compra</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario de pago y datos */}
          <div className="lg:col-span-2">
            {/* Detalles de Contacto y Envío */}
            <div className="bg-gray-900 p-6 rounded-lg border border-red-500/20 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-400">1. Detalles de Contacto y Envío</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><p className="font-bold">Nombre:</p><p>{user.name}</p></div>
                  <div><p className="font-bold">Email:</p><p>{user.email}</p></div>
                  <div><p className="font-bold">Dirección:</p><p>{user.address || 'No especificada'}</p></div>
                  <div><p className="font-bold">Teléfono:</p><p>{user.phone || 'No especificado'}</p></div>
                </div>
                <Link href="/perfil" className="text-xs text-red-400 hover:underline mt-2 inline-block">Editar mis datos</Link>
              </div>

              {/* Botón y formulario de Mercado Pago */}
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400">2. Método de Pago</h3>
                <MercadoPagoButton items={items} />
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen de la orden */}
          <div className="bg-gray-900 p-6 rounded-lg border border-red-500/20 self-start">
            <h2 className="text-xl font-semibold mb-6 border-b border-gray-700 pb-4">Resumen del Pedido</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} x{item.quantity}</span>
                  <span className="font-mono">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-4 mt-6">
              <span>Total</span>
              <span className="font-mono">{formatPrice(getTotalPrice())}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}