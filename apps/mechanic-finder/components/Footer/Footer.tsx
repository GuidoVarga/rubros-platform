import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-muted py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">Encontra Mecánico</h3>
            <p className="text-sm text-muted-foreground mb-4">
              El directorio más completo de talleres mecánicos en Argentina. Información pública actualizada las 24 horas.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/encontramecanico" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Seguinos en Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/encontramecanico" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Seguinos en Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/encontramecanico" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary" aria-label="Seguinos en Instagram">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Servicios Principales</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/servicios/mecanica-general" className="text-muted-foreground hover:text-primary">Mecánica General</Link></li>
              <li><Link href="/servicios/cambio-aceite" className="text-muted-foreground hover:text-primary">Cambio de Aceite</Link></li>
              <li><Link href="/servicios/reparacion-frenos" className="text-muted-foreground hover:text-primary">Reparación de Frenos</Link></li>
              <li><Link href="/servicios/diagnostico-computarizado" className="text-muted-foreground hover:text-primary">Diagnóstico Computarizado</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Enlaces Útiles</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.argentina.gob.ar/transporte/vehiculos" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Registro Nacional de Vehículos</a></li>
              <li><a href="https://www.dnrpa.gov.ar/portal_dnrpa/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">DNRPA Oficial</a></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog de Mantenimiento</Link></li>
              <li><Link href="/consejos-mecanicos" className="text-muted-foreground hover:text-primary">Consejos para Conductores</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Información Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/acerca" className="text-muted-foreground hover:text-primary">Quiénes Somos</Link></li>
              <li><Link href="/contacto" className="text-muted-foreground hover:text-primary">Contactanos</Link></li>
              <li><Link href="/terminos-condiciones" className="text-muted-foreground hover:text-primary">Términos y Condiciones</Link></li>
              <li><Link href="/politica-privacidad" className="text-muted-foreground hover:text-primary">Política de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Encontra Mecánico. Todos los derechos reservados.</p>
          <p className="mt-2">
            Directorio informativo de talleres mecánicos en Argentina basado en información pública.
          </p>
        </div>
      </div>
    </footer>
  );
};