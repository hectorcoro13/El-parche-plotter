// src/components/products-section.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { useScrollAnimation } from "../hooks/use-scroll-animation"
import { Product } from "../types/products"
import { useCartStore } from "../store/useCartStore"

export function ProductsSection() {
  const addToCart = useCartStore((state) => state.addToCart) 
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
        if (!response.ok) {
          throw new Error("Error al obtener los productos")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchProducts()
  }, []) 

  // --- FUNCIÓN CORREGIDA PARA FORMATEAR EL PRECIO ---
  const formatPrice = (price: number) => { // Acepta un 'number'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <section ref={sectionRef} id="productos" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">Nuestros Retablos</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cada pieza es única, diseñada especialmente para ti con los más altos estándares de calidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`bg-black border-red-500/20 hover:border-red-500/50 transition-all duration-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10 group flex flex-col`}
              style={{
                transitionDelay: sectionVisible ? `${index * 150}ms` : "0ms",
              }}
            >
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.imgUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="text-center flex-grow flex flex-col">
                  <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex-grow">{product.description}</p>
                  <div className="flex items-center justify-center mb-4">
                    {/* Aseguramos que el precio sea un número antes de pasarlo */}
                    <span className="text-2xl font-bold text-red-500">{formatPrice(Number(product.price))}</span>
                  </div>
                </div>
               <Button 
                  onClick={() => addToCart(product)}
                  className="w-full mt-auto bg-red-500 hover:bg-red-600 ...">
                  Añadir al Carrito
               </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}