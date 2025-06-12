import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { AdComponent } from "@/components/ads/ads";
import { Suspense } from "react";
import { SkeletonPage } from "@rubros/ui";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://rubros.com.ar"),
  title: {
    default: "Rubros - Encuentra los mejores servicios en tu zona",
    template: "%s | Rubros",
  },
  description:
    "Encuentra los mejores servicios en tu zona. Mecánicos, electricistas, plomeros y más. Compara precios, lee reseñas y contacta directamente.",
  keywords: [
    "servicios",
    "mecánicos",
    "electricistas",
    "plomeros",
    "argentina",
    "buenos aires",
    "córdoba",
    "rosario",
  ],
  authors: [{ name: "Rubros" }],
  creator: "Rubros",
  publisher: "Rubros",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "https://rubros.com.ar",
    title: "Rubros - Encuentra los mejores servicios en tu zona",
    description:
      "Encuentra los mejores servicios en tu zona. Mecánicos, electricistas, plomeros y más. Compara precios, lee reseñas y contacta directamente.",
    siteName: "Rubros",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rubros - Encuentra los mejores servicios en tu zona",
    description:
      "Encuentra los mejores servicios en tu zona. Mecánicos, electricistas, plomeros y más. Compara precios, lee reseñas y contacta directamente.",
    creator: "@rubros",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex-1">
            <div className="flex flex-col gap-8">
              <Suspense>
                <AdComponent type="top" />
              </Suspense>
              <Suspense fallback={<SkeletonPage />}>
                <div>{children}</div>
              </Suspense>
              <section className="container py-16">
                <h2 className="text-3xl font-bold tracking-tight text-center mb-8">
                  ¿Por qué elegirnos?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Servicios Verificados</h3>
                    <p className="text-muted-foreground">
                      Todos los servicios son verificados por nuestro equipo.
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Reseñas Reales</h3>
                    <p className="text-muted-foreground">
                      Lee opiniones de clientes reales antes de elegir.
                    </p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Contacto Directo</h3>
                    <p className="text-muted-foreground">
                      Contacta directamente con los profesionales sin intermediarios.
                    </p>
                  </div>
                </div>
              </section>
              <Suspense>
                <section className="container mb-8">
                  <AdComponent type="footer" />
                </section>
              </Suspense>
            </div>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
