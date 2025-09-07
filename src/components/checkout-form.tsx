"use client";

import { useState, useEffect } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore";
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";
import Link from "next/link";

// Definimos los tipos para los props
interface User {
  id: string; name: string; email: string; address?: string | null; city?: string | null; phone?: string | number | null;
}
interface CartItem {
  id: string; name: string; quantity: number; price: string | number;
}

export function CheckoutForm({ user, items }: { user: User; items: CartItem[] }) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const { clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });
    } else {
      console.error("MercadoPago public key is not defined");
    }
  }, []);

  useEffect(() => {
    const createPreference = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const itemsToCreate = items.map(item => ({
          id: item.id, title: item.name, unit_price: Number(item.price), quantity: item.quantity
        }));

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mercadopago/create-preference`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: itemsToCreate }),
        });
        
        const data = await response.json();
        if (data.preferenceId) {
          setPreferenceId(data.preferenceId);
        } else {
          throw new Error("No se pudo obtener la preferencia de pago.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (items.length > 0) createPreference();
  }, [items]);

  const handleOnSubmit = async (formData: any) => {
    const orderData = {
      userId: user.id,
      products: items.map(item => ({ id: item.id })),
    };
    
    try {
      // 1. Crear la orden en nuestro backend primero
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) throw new Error('No se pudo crear la orden.');

      // 2. Si la orden se crea, mostrar confirmación y limpiar el carrito
       await Swal.fire({
          title: '¡Pago Exitoso!',
          text: 'Tu compra ha sido realizada con éxito. Revisa tu correo para ver los detalles.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          background: '#111827', color: '#FFFFFF'
        });
        
        clearCart();
        router.push('/perfil');

    } catch (err: any) {
      console.error("Error en el proceso de pago:", err);
      Swal.fire('Error', 'Hubo un problema al procesar tu pago. Inténtalo de nuevo.', 'error');
    }
  };

  return (
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
      
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-red-400">2. Método de Pago</h3>
        {isLoading && <p>Cargando formulario de pago...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {preferenceId && (
          <div id="payment-brick-container">
            <Payment
              initialization={{
                amount: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
                preferenceId: preferenceId,
              }}
              customization={{
                paymentMethods: {
                  creditCard: 'all',
                  debitCard: 'all',
                  mercadoPago: 'all',
                  bankTransfer: 'all', // Correcto. Esto habilita PSE, y DENTRO de PSE se encuentra Nequi.
                  ticket: 'all',       // Correcto. Esto habilita pagos en efectivo como Efecty.
                },
                visual: {
                  style: { 
                    theme: 'dark', 
                    customVariables: { 
                      formBackgroundColor: '#111827',
                      baseColor: '#ef4444',
                      borderRadiusFull: '8px',
                      inputBackgroundColor: '#030712',
                      errorColor: '#fca5a5'
                    } 
                  }
                }
              }}
              onSubmit={handleOnSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}