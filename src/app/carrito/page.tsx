"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/navbar";
import { Footer } from "../../components/footer";
import { useCartStore } from "../../store/useCartStore";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Trash2 } from "lucide-react";
import { useUIStore } from "../../store/useUIStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function CartPage() {
  // --- 1. CAMBIO AQUÍ ---
  // Reemplazamos 'removeFromCart' por la nueva función 'decreaseOrRemoveItem'.
  const { items, decreaseOrRemoveItem, getTotalPrice } = useCartStore();
  const cartItemCount = useCartStore(state => state.items.length); // Usamos la longitud para el estado vacío
  // --- FIN DEL CAMBIO ---

  const { isLoggedIn } = useAuthStore();
  const openAuthModal = useUIStore((state) => state.openAuthModal);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleLoginRedirect = () => {
    if (!isLoggedIn) {
      openAuthModal();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold font-serif mb-8 text-center md:text-left">
          Tu Carrito de Compras
        </h1>
        
        {isClient && cartItemCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id} // La key sigue siendo el id único
                  className="flex items-center bg-gray-900 p-4 rounded-lg border border-red-500/10"
                >
                  <Image
                    src={ item.imgUrl && item.imgUrl !== "No image" ? item.imgUrl : "/placeholder.svg" }
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-md object-cover aspect-square"
                  />
                  <div className="ml-4 flex-grow">
                    <h2 className="font-semibold">{item.name}</h2>
                    <p className="text-sm text-gray-400">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {formatPrice(Number(item.price) * item.quantity)}
                    </p>
                    {/* --- 2. CAMBIO AQUÍ --- */}
                    {/* El botón ahora llama a la nueva función. */}
                    <button
                      onClick={() => decreaseOrRemoveItem(item.id)}
                      className="text-gray-500 hover:text-red-400 mt-1 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                    {/* --- FIN DEL CAMBIO --- */}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-red-500/10 self-start">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Subtotal</span>
                <span className="font-mono">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-4 mt-4">
                <span>Total Estimado</span>
                <span className="font-mono">{formatPrice(getTotalPrice())}</span>
              </div>

              <div className="w-full mt-6">
                {isLoggedIn ? (
                  <Link href="/checkout" passHref>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Continuar con la Compra
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={handleLoginRedirect}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Inicia sesión para continuar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16">
            {isClient ? (
              <>
                <p className="mb-6">Tu carrito está vacío.</p>
                <Link href="/productos" passHref>
                   <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white bg-transparent">
                      Ver Productos
                   </Button>
                </Link>
              </>
            ) : (
              <p>Cargando carrito...</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}