import type { Metadata } from "next";
import { AdSenseComponent } from "@/components/ads/AdSenseComponent";
import { ADSENSE_SLOTS } from "@rubros/ui/constants";

export const metadata: Metadata = {
  title: "AdSense Test - Encontrá Mecánico",
  description: "Página de prueba para verificación de Google AdSense",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdSenseTestPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Página de Prueba AdSense
        </h1>

        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Anuncio Superior</h2>
            <AdSenseComponent
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP || "top-ad"}
              type={ADSENSE_SLOTS.TOP}
              style={{ minHeight: "280px" }}
              className="max-w-[1100px] mx-auto"
            />
          </div>

          <div className="bg-gray-100 p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Contenido de Prueba</h2>
            <p className="mb-4">
              Esta es una página de prueba para verificar que Google AdSense funciona correctamente
              en nuestro sitio web. Los anuncios deben aparecer arriba y abajo de este contenido.
            </p>
            <p className="mb-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
              nostrud exercitation ullamco laboris.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit en voluptate velit esse cillum dolore
              eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Anuncio Inferior</h2>
            <AdSenseComponent
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED || "in-feed-ad"}
              type={ADSENSE_SLOTS.IN_FEED}
              style={{ minHeight: "280px" }}
              className="max-w-[1100px] mx-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}