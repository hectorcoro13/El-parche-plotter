// Reemplaza todo el contenido de tu archivo con esta versión corregida

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { ShoppingCart, LogOut, LayoutDashboard, Menu, X, User } from "lucide-react" // Importa el ícono de User
import { AuthModal } from "./auth-modal" 
import { useCartStore } from "../store/useCartStore"
import { useUIStore } from "../store/useUIStore"
import { useAuthStore } from "../store/useAuthStore"
import Swal from 'sweetalert2'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthModalOpen, openAuthModal, closeAuthModal } = useUIStore();
  
  const items = useCartStore(state => state.items);
  const cartCount = items.length;
  
  const { logout, isLoggedIn, user, isAuthLoading } = useAuthStore();
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const handleLogout = () => {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "¿Estás seguro de que quieres salir?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#4B5563',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#111827',
      color: '#FFFFFF'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        window.location.href = '/'; 
      }
    })
  };
  
  if (!hasMounted) {
    return <nav className="bg-black/95 h-16"></nav>;
  }

  return (
    <>
      <nav className="bg-black/95 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex-shrink-0 flex items-center">
              <Link href="/"><Image src="/logo.png" alt="El Parche Plotter" width={50} height={50} className="rounded-full" /></Link>
              <Link href="/" className="ml-3 text-xl font-bold text-white hover:text-red-500 transition-colors hidden sm:block">EL PARCHE</Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/" className="text-white hover:text-red-500 transition-colors px-4 py-2 rounded-md">Inicio</Link>
              <Link href="/productos" className="text-white hover:text-red-500 transition-colors px-4 py-2 rounded-md">Productos</Link>
              <Link href="/servicios" className="text-white hover:text-red-500 transition-colors px-4 py-2 rounded-md">Servicios</Link>
              {user?.isAdmin && (
                <Link href="/admin" className="flex items-center text-white hover:text-red-500 transition-colors px-4 py-2 rounded-md">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center">
              {isAuthLoading ? (
                <div className="text-white text-sm h-9"></div>
              ) : isLoggedIn ? (
                <>
                  <Link href="/perfil" passHref>
                    <Button variant="ghost" className="text-white hover:bg-gray-800 hover:text-white">
                      <Image src={user?.imageProfile && user.imageProfile !== 'No image' ? user.imageProfile : "/placeholder-user.jpg"} alt="Perfil" width={24} height={24} className="rounded-full mr-2 object-cover" key={user?.imageProfile} />
                      Mi Perfil
                    </Button>
                  </Link>
                  <Link href="/carrito" className="relative cursor-pointer ml-4">
                    <ShoppingCart className="w-6 h-6 text-white hover:text-red-500 transition-colors" />
                    {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                  </Link>
                  <div className="ml-auto pl-4">
                    <Button onClick={handleLogout} variant="destructive" className="bg-red-600 hover:bg-red-700">
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </>
              ) : (
                 <div className="flex items-center space-x-4">
                  <Button variant="outline" className="border-white/50 text-white hover:bg-white/10 hover:text-white bg-transparent" onClick={openAuthModal}>
                    Iniciar Sesión / Registro
                  </Button>
                  <Link href="/carrito" className="relative cursor-pointer">
                    <ShoppingCart className="w-6 h-6 text-white hover:text-red-500 transition-colors" />
                    {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                  </Link>
                 </div>
              )}
            </div>
            
            <div className="md:hidden flex items-center">
               <Link href="/carrito" className="relative cursor-pointer mr-4">
                  <ShoppingCart className="w-6 h-6 text-white hover:text-red-500 transition-colors" />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartCount}</span>}
                </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* --- CORRECCIÓN EN MENÚ MÓVIL --- */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-lg pb-4 px-2 space-y-1">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-red-500 px-3 py-2 rounded-md">Inicio</Link>
            <Link href="/productos" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-red-500 px-3 py-2 rounded-md">Productos</Link>
            <Link href="/servicios" onClick={() => setIsMenuOpen(false)} className="block text-white hover:text-red-500 px-3 py-2 rounded-md">Servicios</Link>
            {user?.isAdmin && (
              <Link href="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center text-white hover:text-red-500 px-3 py-2 rounded-md">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            )}
            <div className="border-t border-red-500/20 pt-4">
              {isLoggedIn ? (
                <>
                  <Link href="/perfil" onClick={() => setIsMenuOpen(false)} className="flex items-center text-white hover:text-red-500 px-3 py-2 rounded-md mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Mi Perfil
                  </Link>
                  <Button onClick={handleLogout} variant="destructive" className="w-full bg-red-600 hover:bg-red-700">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                // El botón que se mostraba antes ya era el correcto, lo mantengo aquí para asegurar.
                <Button variant="outline" className="w-full border-white/50 text-white hover:bg-white/10" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
                  Iniciar Sesión / Registro
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>
      {!isLoggedIn && <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />}
    </>
  )
}