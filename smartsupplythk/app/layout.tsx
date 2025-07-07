import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Smart Supply - Abastecimiento Inteligente",
  description:
    "Smart Supply es una aplicación inteligente diseñada para automatizar y optimizar el abastecimiento de productos para tiendas minoristas.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-900">{children}</body>
    </html>
  )
}
