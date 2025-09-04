"use client"

import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { Award, Heart } from "lucide-react"

export function InfoCards() {
  const { ref, isVisible } = useScrollAnimation()

  return (
    <section ref={ref} className="py-20 px-4 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className={`bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 rounded-lg p-8 text-center hover:border-red-500/50 transition-all duration-500 hover:scale-105 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <Award className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Calidad Premium</h3>
            <p className="text-gray-300">
              Utilizamos materiales de la más alta calidad para garantizar que tu retablo perdure por generaciones.
            </p>
          </div>

          <div
            className={`bg-gradient-to-br from-red-900/20 to-black border border-red-500/30 rounded-lg p-8 text-center hover:border-red-500/50 transition-all duration-500 hover:scale-105 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Satisfacción Garantizada</h3>
            <p className="text-gray-300">
              Tu satisfacción es nuestra prioridad. Trabajamos contigo hasta lograr el resultado perfecto.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
