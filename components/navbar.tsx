"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Menu, X } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image src="/logo.png" alt="El Parche Plotter" width={50} height={50} className="rounded-full" />
            </Link>
            <Link href="/" className="ml-3 text-xl font-bold text-white hover:text-red-500 transition-colors">
              EL PARCHE
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-white hover:text-red-500 transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-white hover:text-red-500 transition-colors">
                Productos
              </Link>
              <Link href="/servicios" className="text-white hover:text-red-500 transition-colors">
                Servicios
              </Link>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black transition-colors bg-transparent"
            >
              Iniciar Sesión / Registro
            </Button>
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white cursor-pointer hover:text-red-500 transition-colors" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white hover:text-red-500">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-red-500/20">
              <Link href="/" className="block text-white hover:text-red-500 py-2">
                Inicio
              </Link>
              <Link href="/productos" className="block text-white hover:text-red-500 py-2">
                Productos
              </Link>
              <Link href="/servicios" className="block text-white hover:text-red-500 py-2">
                Servicios
              </Link>
              <div className="pt-4 space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white hover:text-black bg-transparent"
                >
                  Iniciar Sesión / Registro
                </Button>
                <div className="flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-white" />
                  <span className="ml-2 text-white">Carrito (0)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
