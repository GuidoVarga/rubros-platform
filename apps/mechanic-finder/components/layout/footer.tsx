import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Rubros</h3>
            <p className="text-sm text-muted-foreground">
              Encuentra los mejores servicios en tu zona.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/mecanicos" className="text-sm text-muted-foreground hover:text-foreground">
                  Mecánicos
                </Link>
              </li>
              <li>
                <Link href="/electricistas" className="text-sm text-muted-foreground hover:text-foreground">
                  Electricistas
                </Link>
              </li>
              <li>
                <Link href="/plomeros" className="text-sm text-muted-foreground hover:text-foreground">
                  Plomeros
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Zonas</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/buenos-aires" className="text-sm text-muted-foreground hover:text-foreground">
                  Buenos Aires
                </Link>
              </li>
              <li>
                <Link href="/cordoba" className="text-sm text-muted-foreground hover:text-foreground">
                  Córdoba
                </Link>
              </li>
              <li>
                <Link href="/rosario" className="text-sm text-muted-foreground hover:text-foreground">
                  Rosario
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Rubros. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}