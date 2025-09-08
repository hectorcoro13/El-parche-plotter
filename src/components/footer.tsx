"use client"

import { Phone, MessageCircle, Instagram } from "lucide-react"
import { useScrollAnimation } from "../hooks/use-scroll-animation"

export function Footer() {
  const { ref: footerRef, isVisible: footerVisible } = useScrollAnimation(0.1)

  return (
    <footer ref={footerRef} className="bg-black border-t border-red-500/20 py-12">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          footerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 font-serif">EL PARCHE PLOTTER</h3>
            <p className="text-gray-400 mb-4">
              Arte urbano personalizado que define tu espacio y refleja tu personalidad única.
            </p>
          </div>

          {/* Contact Direct */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contacto Directo</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/573188944869"
                className="flex items-center text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                WhatsApp: +57 3188944869
              </a>
              <div className="flex items-center text-gray-400">
                <Phone className="w-5 h-5 mr-3" />
                Teléfono: +57 3188944869
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Síguenos</h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/el_parche.plotter?igsh=MW42d3N5MjNxdDJocg=="
                className="text-gray-400 hover:text-red-500 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-red-500/20 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 El Parche Plotter. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}