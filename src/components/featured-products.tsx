"use client"

import { useScrollAnimation } from "../hooks/use-scroll-animation"
import { Button } from "./ui/button"
import { ShoppingCart } from "lucide-react"
import { useCartStore } from "../store/useCartStore" // 1. Importa la store del carrito
import { Product } from "../types/products" // Importa el tipo Product si es necesario

export function FeaturedProducts() {
  const { ref, isVisible } = useScrollAnimation()
  const addToCart = useCartStore((state) => state.addToCart) // 2. Obtén la función para añadir

  // Asegúrate que los productos aquí coincidan con la estructura del tipo 'Product'
  const featuredProducts: Omit<Product, 'id' | 'imgUrl'>[] = [
    {
      name: "Retablo Familiar Premium",
      price: "45000",
      image: "/family-portrait-wooden-plaque-dark-background.jpg",
      description: "Retablo personalizado en madera de alta calidad",
    },
    {
      name: "Retablo Mascota Especial",
      price: "35000",
      image: "/pet-portrait-wooden-plaque-dark-background.jpg",
      description: "Inmortaliza a tu mascota en un hermoso retablo",
    },
    {
      name: "Retablo Pareja Romántico",
      price: "40000",
      image: "/couple-portrait-wooden-plaque-dark-background.jpg",
      description: "El regalo perfecto para parejas enamoradas",
    },
  ]
  
  const formatPrice = (priceString: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(Number(priceString));
  };

  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white font-serif">Productos Destacados</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">Descubre nuestros retablos más populares y únicos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.map((product, index) => (
            <div
              key={index}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-red-500/20 hover:border-red-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-300 mb-4 flex-grow">{product.description}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-auto">
                  <span className="text-2xl font-bold text-red-500 text-center sm:text-left">{formatPrice(product.price)}</span>
                  {/* 3. Llama a la función addToCart con los datos del producto */}
                  <Button 
                    onClick={() => addToCart({id: `featured-${index}`, ...product} as Product)}
                    className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105 shrink-0"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Añadir al Carrito
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}