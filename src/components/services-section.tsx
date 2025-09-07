"use client"

import { Card, CardContent } from "../components/ui/card"
import { Scissors, Sticker, Palette, Printer, Shirt, Gift } from "lucide-react"
import { useScrollAnimation } from "../hooks/use-scroll-animation"

const services = [
  {
    icon: <Scissors className="w-12 h-12" />,
    title: "Plotter",
    description: "Cortes de precisión en vinil para cualquier superficie",
  },
  {
    icon: <Sticker className="w-12 h-12" />,
    title: "Calcomanías",
    description: "Diseños adhesivos personalizados para vehículos y más",
  },
  {
    icon: <Palette className="w-12 h-12" />,
    title: "Diseño Gráfico",
    description: "Creación de logotipos, tarjetas y material publicitario",
  },
  {
    icon: <Printer className="w-12 h-12" />,
    title: "Impresión Digital",
    description: "Impresiones de alta calidad en diversos materiales",
  },
  {
    icon: <Shirt className="w-12 h-12" />,
    title: "Textiles",
    description: "Personalización de camisetas, gorras y uniformes",
  },
  {
    icon: <Gift className="w-12 h-12" />,
    title: "Regalos Personalizados",
    description: "Artículos únicos para ocasiones especiales",
  },
]

export function ServicesSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.1)

  return (
    <section ref={sectionRef} className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-serif">Soluciones Gráficas Completas</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ofrecemos una amplia gama de servicios de diseño gráfico y personalización para satisfacer todas tus
            necesidades creativas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`bg-gray-900 border-red-500/20 hover:border-red-500/50 transition-all duration-700 hover:scale-105 hover:shadow-lg hover:shadow-red-500/10 group ${
                sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
              style={{
                transitionDelay: sectionVisible ? `${index * 150}ms` : "0ms",
              }}
            >
              <CardContent className="p-8 text-center">
                <div className="text-red-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{service.title}</h3>
                <p className="text-gray-400 leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
