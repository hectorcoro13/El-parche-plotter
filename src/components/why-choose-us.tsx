"use client"

import { Card, CardContent } from "./ui/card"
import { Palette, Zap, Heart, Star } from "lucide-react"
import { useScrollAnimation } from "../hooks/use-scroll-animation"

const reasons = [
  {
    icon: <Palette className="w-8 h-8" />,
    title: "Diseño Personalizado",
    description: "Creamos diseños únicos basados en tus ideas y preferencias",
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Entrega Rápida",
    description: "Procesos optimizados para entregarte tu arte en tiempo récord",
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Calidad Premium",
    description: "Materiales de alta calidad que garantizan durabilidad y belleza",
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: "Satisfacción Garantizada",
    description: "Tu satisfacción es nuestra prioridad, garantizamos resultados excepcionales",
  },
]

export function WhyChooseUs() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1)

  return (
    <section ref={sectionRef} className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">¿Por Qué Elegirnos?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Somos más que una tienda, somos artistas comprometidos con hacer realidad tu visión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <Card
              key={index}
              className={`bg-gray-900 border-red-500/20 hover:border-red-500/50 transition-all duration-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10 group ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: sectionVisible ? `${index * 200}ms` : "0ms",
              }}
            >
              <CardContent className="p-6 text-center">
                <div className="text-red-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{reason.title}</h3>
                <p className="text-gray-400">{reason.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
