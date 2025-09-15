"use client";

import { useState, useEffect, useMemo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { useAuthStore } from "../store/useAuthStore";
import { useCartStore } from "../store/useCartStore"; 
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";

// Tipado de los items del carrito
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: string | number;
}

export function MercadoPagoButton({ items }: { items: CartItem[] }) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isPreferenceLoading, setIsPreferenceLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);

  const { token, user } = useAuthStore();
  const { clearCart } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });
    } else {
      setError("La configuración de pago no está disponible.");
    }
  }, []);

  useEffect(() => {
    const createPreference = async () => {
      if (!token || items.length === 0) {
        setIsPreferenceLoading(false);
        return;
      }
      
      setError(null);
      try {
        const itemsToCreate = items.map(item => ({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        }));

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/mercadopago/create-preference`,
          {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ items: itemsToCreate }),
          },
        );
        
        const data = await response.json();
        if (response.ok && data.preferenceId) {
          setPreferenceId(data.preferenceId);
        } else {
          throw new Error(data.message || "No se pudo crear la preferencia de pago.");
        }
      } catch (err: any) {
        console.error("Error creating preference:", err);
        setError(err.message);
      } finally {
        setIsPreferenceLoading(false);
      }
    };

    createPreference();
  }, [token, items]);

  const handleOnSubmit = async (formData: any) => {
    const paymentResult = formData;

    if (paymentResult.status === 'approved') {
      try {
        const orderData = {
          userId: user?.id,
          products: items.map(item => ({ id: item.id })),
        };
        
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(orderData),
        });

        if (!orderResponse.ok) {
          throw new Error('El pago fue exitoso pero hubo un problema al registrar tu orden.');
        }

        await Swal.fire({
          title: '¡Pago Exitoso!',
          text: 'Tu compra ha sido realizada.',
          icon: 'success',
          timer: 3000,
          showConfirmButton: false,
          background: '#111827', color: '#FFFFFF'
        });

        clearCart();
        router.push('/perfil');
      } catch (err: any) {
        console.error("Error al crear la orden después del pago:", err);
        Swal.fire({
          title: 'Error en la Orden',
          text: err.message,
          icon: 'error',
          background: '#111827', color: '#FFFFFF'
        });
      }
    } else {
      // LOG #3: VER LA RESPUESTA COMPLETA DEL BRICK CUANDO EL PAGO ES RECHAZADO
      console.error('--- PAGO NO APROBADO. Respuesta completa del Brick: ---');
      console.log(JSON.stringify(paymentResult, null, 2));

      Swal.fire({
        title: 'Error en el Pago',
        text: 'El pago no fue aprobado. Por favor, revisa tus datos o el método de pago.',
        icon: 'error',
        background: '#111827', color: '#FFFFFF'
      });
    }
  };

  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [items]);

  return (
    <div className="w-full">
      {isPreferenceLoading ? (
        <p className="text-center text-gray-400">Cargando método de pago...</p>
      ) : error ? (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      ) : preferenceId ? (
        <Payment
          initialization={{
            amount: totalAmount,
            preferenceId: preferenceId,
          }}
          customization={{
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
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
          onError={(error) => console.error(error)}
        />
      ) : (
        <p className="text-center text-yellow-500">No se pudo inicializar el pago. Revisa tu sesión y los productos del carrito.</p>
      )}
    </div>
  );
}