import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@rubros/ui";
import { Footer } from "@/components/Footer/Footer";
import { AdComponent } from "@/components/ads/ads";
import { Suspense } from "react";
import { SkeletonPage } from "@rubros/ui";
import { ORGANIZATION } from "@/constants/org";
import Link from "next/link";
import { APP_NAME } from "@/constants/app";

const inter = Inter({ subsets: ["latin"] });

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: ORGANIZATION.name,
  url: ORGANIZATION.url,
  logo: `${ORGANIZATION.url}/logo.png`,
  description: ORGANIZATION.description,
  foundingDate: "2024",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+54-11-1234-5678",
    contactType: "customer service",
    availableLanguage: ["Spanish"]
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "AR"
  },
  sameAs: [
    "https://facebook.com/encontramecanico",
    "https://twitter.com/encontramecanico",
    "https://instagram.com/encontramecanico"
  ]
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(ORGANIZATION.url),
    title: {
      default: `${ORGANIZATION.name} - ${ORGANIZATION.shortDescription}`,
      template: `%s | ${ORGANIZATION.name}`,
    },
    description: ORGANIZATION.description,
    keywords: [
      'mecánicos Argentina',
      'talleres mecánicos',
      'servicio automotriz',
      'reparación auto',
      'mecánico cerca',
      'taller Buenos Aires',
      'servicio mecánico',
      'diagnóstico auto',
      'mecánica general',
      'cambio aceite',
    ],
    authors: [{ name: ORGANIZATION.name }],
    creator: ORGANIZATION.name,
    publisher: ORGANIZATION.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'es_AR',
      url: ORGANIZATION.url,
      title: ORGANIZATION.name,
      description: ORGANIZATION.description,
      siteName: ORGANIZATION.name,
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: `${ORGANIZATION.name} - Directorio de mecánicos en Argentina`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ORGANIZATION.name,
      description: ORGANIZATION.description,
      site: '@encontramecanico',
      creator: '@encontramecanico',
      images: ['/og-image.jpg'],
    },
    verification: {
      google: 'your-google-verification-code',
    },
    alternates: {
      canonical: ORGANIZATION.url,
    },
  };
}

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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header
            renderLink={({ href, children, className }) => <Link href={href} className={className}>{children}</Link>}
            appName={APP_NAME}
          />
          <main className="flex-1">
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
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
