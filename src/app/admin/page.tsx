"use client";

import { AdminLayout } from "../../components/AdminLayout";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import Swal from "sweetalert2";

// Componente reutilizable para las tarjetas de estadísticas
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
};

const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <div className="bg-black p-6 rounded-lg border border-red-500/20">
    <div className="flex items-center">
      <div className="p-3 bg-red-500/10 rounded-md">
        <Icon className="w-6 h-6 text-red-400" />
      </div>
      <div className="ml-4">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0, totalUsers: 0, totalProducts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("No se pudieron cargar las estadísticas.");
        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        Swal.fire('Error', error.message, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center text-gray-400">Cargando estadísticas...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold font-serif mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Ingresos Totales" 
          value={new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(stats.totalRevenue)} 
          icon={DollarSign} 
        />
        <StatCard 
          title="Ventas Totales" 
          value={stats.totalSales} 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="Usuarios Registrados" 
          value={stats.totalUsers} 
          icon={Users} 
        />
        <StatCard 
          title="Productos Activos" 
          value={stats.totalProducts} 
          icon={Package} 
        />
      </div>
 
      <div className="mt-8 bg-black p-6 rounded-lg border border-red-500/20">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-500">Próximamente: Listado de últimas órdenes y registros...</p>
      </div>
    </AdminLayout>
  );
}