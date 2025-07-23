import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bloquear páginas de debug en producción
  const debugRoutes = ['/analytics-test', '/adsense-debug'];

  if (debugRoutes.some((route) => pathname.startsWith(route))) {
    // Solo permitir en development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.rewrite(new URL('/404', request.url));
    }

    // En development, opcional: requerir query param secreto
    const debugKey = request.nextUrl.searchParams.get('debug');
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG_KEY) {
      if (debugKey !== process.env.DEBUG_KEY) {
        return NextResponse.rewrite(new URL('/404', request.url));
      }
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
