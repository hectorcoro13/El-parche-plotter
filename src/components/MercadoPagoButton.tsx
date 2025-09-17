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
    // Inicializa Mercado Pago
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, { locale: 'es-CO' });
    } else {
      setError("La configuración de pago no está disponible.");
    }
  }, []);

  useEffect(() => {
    // Crea la preferencia de pago en el backend
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

  const handleOnSubmit = async (formData: any, additionalData?: any) => {
  // El ID del pago lo extraemos de los datos que nos pasa el Brick.
  // Puede venir en 'formData.id' o a veces como 'formData.payment_id'.
  const paymentId = formData.id || formData.payment_id;

  // Log para depurar en el navegador qué estamos recibiendo del Brick
  console.log("--- [BRICK] Datos recibidos en onSubmit:", JSON.stringify({ formData, additionalData }, null, 2));

  if (!paymentId) {
    Swal.fire({
      title: 'Error',
      text: 'No se pudo obtener el ID del pago. Inténtalo de nuevo.',
      icon: 'error',
      background: '#111827',
      color: '#FFFFFF'
    });
    return;
  }
  
  // Mostramos un loading para que el usuario espere
  Swal.fire({
    title: 'Verificando tu pago...',
    text: 'Estamos confirmando la transacción de forma segura.',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    background: '#111827', color: '#FFFFFF'
  });

  try {
    const orderData = {
      userId: user?.id,
      products: items.map(item => ({ id: item.id, quantity: item.quantity })),
    };

    // Llamamos al backend para que verifique el paymentId
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mercadopago/process-payment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        paymentId: paymentId,
        orderData: orderData
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'El pago fue rechazado.');
    }

    await Swal.fire({
      title: '¡Pago Exitoso!',
      text: 'Tu compra ha sido confirmada.',
      icon: 'success',
      timer: 3000,
      showConfirmButton: false,
      background: '#111827', color: '#FFFFFF'
    });

    clearCart();
    router.push('/perfil');

  } catch (err: any) {
    console.error("Error en el proceso de pago:", err);
    Swal.fire({
      title: 'Error en el Pago',
      text: err.message,
      icon: 'error',
      background: '#111827', color: '#FFFFFF'
    });
  }
};
}
