"use client";

import { useState, useEffect } from "react";
import { initMercadoPago, Payment, StatusScreen } from "@mercadopago/sdk-react";
import { Button } from "./ui/button";
import { useAuthStore } from "../store/useAuthStore"; // Importa el store de autenticación

// Tipado de los items del carrito
interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: string | number;
}

// Tipado para la respuesta del pago
interface PaymentResponse {
  id: number;
  status: string;
  detail: string;
}

export function MercadoPagoButton({ items }: { items: CartItem[] }) {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  
  // Obtén el token del store de autenticación
  const { token } = useAuthStore(); 

  // La inicialización del SDK sigue siendo la misma.
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY) {
      initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY, {
        locale: 'es-CO'
      });
    } else {
      console.error("MercadoPago public key is not defined");
      setError("La configuración de pago no está disponible.");
    }
  }, []);

  // La creación de la preferencia en el backend sigue siendo necesaria.
  const createPreference = async () => {
    // Valida que el usuario esté autenticado antes de continuar
    if (!token) {
        setError("Debes iniciar sesión para continuar con el pago.");
        return;
    }

    setIsLoading(true);
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
            "Authorization": `Bearer ${token}` // <-- Envía el token en el encabezado
          },
          body: JSON.stringify({ items: itemsToCreate }),
        },
      );
      
      const data = await response.json();
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
      } else {
        throw new Error("Preference ID was not returned.");
      }
    } catch (err: any) {
      console.error("Error creating preference:", err);
      setError("No se pudo iniciar el proceso de pago. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Esta es la función CLAVE para Checkout Bricks.
  const handleOnSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mercadopago/process-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json() as PaymentResponse;
      setPaymentData(result);
      
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Ocurrió un error al procesar tu pago.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya tenemos un resultado del pago, mostramos la pantalla de estado.
  if (paymentData) {
    return (
      <StatusScreen
        initialization={{ paymentId: paymentData.id.toString() }}
        customization={{ backUrls: { return: window.location.href } }}
      />
    );
  }

  return (
    <div className="w-full">
      {!preferenceId ? (
        <Button
          onClick={createPreference}
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600"
        >
          {isLoading ? "Cargando..." : "Proceder al Pago"}
        </Button>
      ) : (
        <Payment
          initialization={{
            amount: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
            preferenceId: preferenceId,
          }}
          customization={{
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              mercadoPago: "all",
            },
          }}
          onSubmit={handleOnSubmit}
          onError={(error) => console.error(error)}
          onReady={() => setIsLoading(false)}
        />
      )}
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}