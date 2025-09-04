"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

const products = [
  {
    id: 1,
    name: "Retablo Familiar Personalizado",
    price: "$45.000",
    image: "/family-photo-retablo-with-pets-and-anime-character.jpg",
    description: "Retablo personalizado con tu familia y mascotas favoritas",
  },
  {
    id: 2,
    name: "Retablo Pop Culture",
    price: "$40.000",
    image: "/anime-characters-retablo-with-pop-culture-icons.jpg",
    description: "Diseños únicos con personajes de anime y cultura pop",
  },
  {
    id: 3,
    name: "Retablo con Frases Motivacionales",
    price: "$35.000",
    image: "/motivational-quotes-retablo-with-urban-design.jpg",
    description: "Frases inspiradoras en diseños urbanos modernos",
  },
  {
    id: 4,
    name: "Stickers Pack Personalizado",
    price: "$15.000",
    image: "/custom-sticker-pack-with-logos-and-characters.jpg",
    description: "Pack de stickers con tus diseños favoritos",
  },
]

export function ProductsSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1)

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <Card
              key={product.id}
              className={`bg-black border-red-500/20 hover:border-red-500/50 transition-all duration-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10 group ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: sectionVisible ? `${index * 150}ms` : "0ms",
              }}
            >
              <CardContent className="p-6">
                <div className="aspect-square mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-500">{product.price}</span>
                </div>
                <Button className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25">
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
