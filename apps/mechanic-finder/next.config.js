/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rubros/ui'],
  trailingSlash: true,
  experimental: {
    serverSourceMaps: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(self)', // ahora permite geolocalización desde tu propio dominio
          },
          {
            key: 'Content-Security-Policy',
            value: [
              // Solo tu dominio puede servir contenido por defecto
              "default-src 'self'",

              // AdSense y scripts externos
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' pagead2.googlesyndication.com googleads.g.doubleclick.net",

              // Estilos locales e inline (Leaflet los necesita)
              "style-src 'self' 'unsafe-inline' unpkg.com",

              // Imágenes locales y externas (tiles de mapas, anuncios, etc.)
              "img-src 'self' data: blob: tile.openstreetmap.org tpc.googlesyndication.com pagead2.googlesyndication.com",

              // Fonts si usás alguna
              "font-src 'self' fonts.gstatic.com",

              // Conexiones a APIs externas
              "connect-src 'self' unpkg.com tile.openstreetmap.org pagead2.googlesyndication.com googleads.g.doubleclick.net",

              // Otros
              "frame-src pagead2.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
