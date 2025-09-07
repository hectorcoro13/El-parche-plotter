"use client";

import { AdminLayout } from "../../../components/AdminLayout";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/useAuthStore";
import Swal from 'sweetalert2';

// Este componente contendrá la lógica para obtener y mostrar las órdenes
type Order = {
  id: string | number;
  user?: {
    name?: string;
  };
  date: string | number | Date;
  orderDetails?: {
    price?: number;
  };
  // Add other fields as needed
};

function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('No se pudieron cargar las órdenes.');
        }

        const data = await response.json();
        setOrders(data);

      } catch (error) {
        const errorMessage = typeof error === "object" && error !== null && "message" in error ? (error as { message: string }).message : "Ocurrió un error inesperado.";
        Swal.fire('Error', errorMessage, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const formatPrice = (price: string | number | bigint) => {
    const numericPrice = typeof price === "string" ? Number(price) : price;
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(numericPrice);
  };
  const formatDate = (date: string | number | Date) => new Date(date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

  if (isLoading) {
    return <p>Cargando órdenes...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold font-serif mb-6">Gestionar Órdenes</h1>
      <div className="bg-black p-4 rounded-lg border border-red-500/20">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="p-4">{order.user?.name || 'N/A'}</td>
                  <td className="p-4">{formatDate(order.date)}</td>
                  <td className="p-4 font-mono">{formatPrice(order.orderDetails?.price || 0)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs font-semibold text-green-200 bg-green-800/50 rounded-full">Completado</span>
                  </td>
                  <td className="p-4">
                    <button className="text-red-400 hover:text-red-300">Ver Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <OrdersManager />
    </AdminLayout>
  );
}