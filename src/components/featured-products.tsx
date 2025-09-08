"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { useScrollAnimation } from "../hooks/use-scroll-animation"
import { useCart } from "../hooks/use-cart" // Importamos el hook del carrito

// Definimos el tipo de un producto para mayor seguridad
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imgUrl?: string;
  stock: number;
}

export function FeaturedProducts() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation(0.2)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedProductId, setAddedProductId] = useState<string | null>(null)
  const { addToCart } = useCart() // Obtenemos la función para añadir al carrito

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/destacados`)
        if (!response.ok) {
          throw new Error("No se pudieron cargar los productos destacados")
        }
        const data: Product[] = await response.json()
        setFeaturedProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Un error desconocido ocurrió")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    setAddedProductId(product.id)
    setTimeout(() => {
      setAddedProductId(null)
    }, 2000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section ref={sectionRef} className="py-20 bg-black text-white">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${
          sectionVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold font-serif">PRODUCTOS DESTACADOS</h2>
          <p className="mt-4 text-lg text-gray-400">Descubre nuestros retablos más populares y únicos</p>
        </div>

        {isLoading ? (
          <div className="text-center">Cargando productos...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900/50 border border-red-500/20 rounded-lg overflow-hidden shadow-lg hover:shadow-red-500/30 transition-shadow duration-300 group"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={product.imgUrl || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2 font-serif">{product.name}</h3>
                  <p className="text-gray-400 mb-4 h-16">{product.description}</p>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-3xl font-bold text-red-500">{formatPrice(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addedProductId === product.id}
                      className={`font-bold py-2 px-4 rounded-full flex items-center transition-colors duration-300 ${
                        addedProductId === product.id
                          ? "bg-green-600"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {addedProductId === product.id ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Añadido!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Añadir al Carrito
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}