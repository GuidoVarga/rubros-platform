import Link from "next/link";
import { Button } from "@rubros/ui";
import { APP_NAME } from "@/constants/app";


export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 min-h-[44px]">
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <nav className="flex items-center gap-4">
            <Link
              href="/acerca"
              className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-6 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            >
              Acerca de
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center min-h-[48px] min-w-[48px] px-6 py-3 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            >
              Contacto
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}