import Link from "next/link";
import { Button } from "@rubros/ui";
import * as RubrosUI from "@rubros/ui";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">Rubros</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" >
              <Link href="/about">Acerca de</Link>
            </Button>
            <Button variant="ghost">
              <Link href="/contact">Contacto</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}