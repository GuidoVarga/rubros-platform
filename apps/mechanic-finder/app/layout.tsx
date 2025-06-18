import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import { AdComponent } from "@/components/ads/ads";
import { Suspense } from "react";
import { SkeletonPage } from "@rubros/ui";
import { generateOrganizationSchema } from '../lib/schema'
import { ORGANIZATION } from "@/constants/org";

const inter = Inter({ subsets: ["latin"] });

export function generateMetadata(): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const org = ORGANIZATION;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${org.name} - Encuentra los mejores mecánicos en tu zona`,
      template: `%s | ${org.name}`,
    },
    description: org.description,
    keywords: [
      "mecánicos",
      "taller mecánico",
      "reparación auto",
      "reparación moto",
      "cambio de aceite",
      "servicio técnico auto",
      "servicio técnico moto",
      "servicio 24hs",
      "Argentina",
      "Buenos Aires",
      "Córdoba",
      "Rosario",
    ],
    authors: [{ name: "Rubros" }],
    creator: org.name,
    publisher: org.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "es_AR",
      url: baseUrl,
      title: `${org.name} - ${org.shortDescription}`,
      description: org.description,
      siteName: org.name,
      images: [
        {
          url: org.logo,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${org.name} - ${org.shortDescription}`,
      description: org.description,
      creator: `@${org.name}`,
      images: [
        {
          url: org.logo,
          width: 1200,
          height: 630,
        },
      ],
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
    alternates: {
      canonical: baseUrl,
    },
    other: {
      'script:ld+json': JSON.stringify(generateOrganizationSchema(org)),
    },
  }
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
