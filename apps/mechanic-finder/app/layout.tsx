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

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const org = ORGANIZATION;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: `${org.name} - ${org.shortDescription}`,
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
    authors: [{ name: org.name }],
    creator: org.name,
    publisher: org.name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
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
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#000000" />
      </head>
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
