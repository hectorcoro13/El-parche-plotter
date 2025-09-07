"use client";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Users, Package } from "lucide-react";
import { Navbar } from "./navbar"; // 1. Importa la Navbar

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user || !user.isAdmin) {
        router.push('/'); 
      }
    }
  }, [user, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Verificando acceso...
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  // --- 2. Ajusta la estructura para incluir la Navbar ---
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar /> {/* <-- Navbar añadida aquí */}
      <div className="flex flex-1">
        <aside className="w-64 bg-black p-4 border-r border-red-500/20 hidden md:block">
          <h2 className="text-2xl font-bold font-serif mb-8 text-center">Admin Panel</h2>
          <nav className="space-y-2">
            <Link href="/admin" className="flex items-center p-2 rounded-md hover:bg-gray-800"><LayoutDashboard className="w-5 h-5 mr-3"/>Dashboard</Link>
            <Link href="/admin/ordenes" className="flex items-center p-2 rounded-md hover:bg-gray-800"><ShoppingBag className="w-5 h-5 mr-3"/>Órdenes</Link>
            <Link href="/admin/usuarios" className="flex items-center p-2 rounded-md hover:bg-gray-800"><Users className="w-5 h-5 mr-3"/>Usuarios</Link>
            <Link href="/admin/productos" className="flex items-center p-2 rounded-md hover:bg-gray-800"><Package className="w-5 h-5 mr-3"/>Productos</Link>
          </nav>
        </aside>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}