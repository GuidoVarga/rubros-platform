import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

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
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
