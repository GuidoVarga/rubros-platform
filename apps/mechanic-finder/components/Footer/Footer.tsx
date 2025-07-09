import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { CookiesConfigureButton } from "../CookiesConfigureButton/CookiesConfigureButton";

export const Footer = () => {
  return (
    <footer className="bg-muted py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Encontrá Mecánico</h3>
            <p className="text-sm text-muted-foreground mb-4">
              El directorio más completo de talleres mecánicos en Argentina. Información pública actualizada las 24 horas.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com/encontramecanico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Seguinos en Facebook"
              >
                <Image width={16} height={16} src="/facebook.svg" alt="Facebook" className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/encontramecanico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Seguinos en X"
              >
                <Image width={16} height={16} src="/x.svg" alt="X" className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/encontramecanico"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Seguinos en Instagram"
              >
                <Image width={16} height={16} src="/instagram.svg" alt="Instagram" className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Servicios principales</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/servicios/mecanica-general" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Mecánica General</Link></li>
              <li><Link href="/servicios/cambio-aceite" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Cambio de Aceite</Link></li>
              <li><Link href="/servicios/reparacion-frenos" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Reparación de Frenos</Link></li>
              <li><Link href="/servicios/diagnostico-computarizado" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Diagnóstico Computarizado</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces Útiles</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.argentina.gob.ar/transporte/vehiculos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Registro Nacional de Vehículos</a></li>
              <li><a href="https://www.dnrpa.gov.ar/portal_dnrpa/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">DNRPA Oficial</a></li>
              <li><a href="https://www.argentina.gob.ar/seguridadvial" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Seguridad Vial</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Información Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/acerca" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Quiénes Somos</Link></li>
              <li><Link href="/contacto" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Contactanos</Link></li>
              <li><Link href="/terminos-y-condiciones" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Términos y Condiciones</Link></li>
              <li><Link href="/politica-privacidad" className="text-muted-foreground hover:text-primary inline-block py-1 min-h-[24px]">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Encontrá Mecánico. Todos los derechos reservados.</p>
          <p className="mt-2">
            Directorio informativo de talleres mecánicos en Argentina basado en información pública.
          </p>
          <div className="mt-4">
            <Suspense>
              <CookiesConfigureButton />
            </Suspense>
          </div>
        </div>
      </div>
    </footer>
  );
};