import type React from "react"
import type { Metadata } from "next"
import { Cinzel, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthInitializer } from "../components/auth-initializer"
import { ProfileCompletionGuard } from "../components/ProfileCompletionGuard" // <-- Importa el guardián

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
})

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "El Parche Plotter - Arte que Define tu Espacio",
  description:
    "Retablos personalizados, stickers únicos y diseños que reflejan tu personalidad. Arte urbano de calidad premium.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${inter.variable} ${cinzel.variable} antialiased`}>
        <AuthInitializer />
        <Suspense fallback={null}>
          {/* Envuelve a {children} con el guardián */}
          <ProfileCompletionGuard>
            {children}
          </ProfileCompletionGuard>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}