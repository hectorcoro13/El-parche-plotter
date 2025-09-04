"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export function FeaturedProducts() {
  const { ref, isVisible } = useScrollAnimation()

  const featuredProducts = [
    {
      id: 1,
      name: "Retablo Familiar Premium",
      price: "$45.000",
      image: "/family-portrait-wooden-plaque-dark-background.jpg",
      description: "Retablo personalizado en madera de alta calidad",
    },
    {
      id: 2,
      name: "Retablo Mascota Especial",
      price: "$35.000",
      image: "/pet-portrait-wooden-plaque-dark-background.jpg",
      description: "Inmortaliza a tu mascota en un hermoso retablo",
    },
    {
      id: 3,
      name: "Retablo Pareja Romántico",
      price: "$40.000",
      image: "/couple-portrait-wooden-plaque-dark-background.jpg",
      description: "El regalo perfecto para parejas enamoradas",
    },
  ]

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
              key={product.id}
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
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-gray-300 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-500">{product.price}</span>
                  <Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105">
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
