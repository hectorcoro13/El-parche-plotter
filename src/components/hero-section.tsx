
import { Button } from "../components/ui/button"
import { TribalFlames } from "../components/tribal-flames"
import Link from "next/link" 

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900 overflow-hidden"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <TribalFlames />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif animate-fade-in">
          Arte que Define tu Espacio
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Retablos personalizados, stickers únicos y diseños que reflejan tu personalidad. Transforma tus ideas en arte
          tangible.
        </p>
        
        {/* 2. Añade el prop 'asChild' al Botón y envuélvelo con Link */}
        <Button
          size="lg"
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
          asChild 
        >
          <Link href="/productos">VER CATÁLOGO</Link>
        </Button>
      </div>
    </section>
  )
}