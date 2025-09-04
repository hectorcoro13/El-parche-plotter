import { Navbar } from "@/components/navbar"
import { ProductsSection } from "@/components/products-section"
import { Footer } from "@/components/footer"
import { FloatingWhatsApp } from "@/components/floating-whatsapp"

export default function ProductosPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Page Header */}
      <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white font-serif">Nuestro Catálogo de Retablos</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explora nuestra amplia colección de retablos personalizados. Cada pieza es única y creada especialmente para
            ti.
          </p>
        </div>
      </section>

      {/* Full Products Grid */}
      <ProductsSection />

      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
