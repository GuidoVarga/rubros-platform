## Informe SEO técnico y plan de ejecución — mechanic-finder

### 1) Objetivo y alcance
Este documento consolida el análisis SEO actual de `apps/mechanic-finder`, detalla problemas y riesgos, y define un plan de implementación paso a paso para cubrir nuevas intenciones de búsqueda locales (especialmente “abiertos” y “cerca”) sin depender de categorías perfectas. Está diseñado para que cualquier desarrollador pueda ejecutarlo directamente.

---

### 2) Contexto del repositorio (resumen)
- Monorepo Turborepo, pnpm.
- App Next.js 15 (App Router) en `apps/mechanic-finder` (SSG por defecto, SSR si agrega valor SEO).
- Rutas actuales (dinámicas y estáticas principales):
  - `/{province}/` → `app/[province]/page.tsx`
  - `/{province}/{city}/` → `app/[province]/[city]/page.tsx`
  - `/{province}/{city}/{business}/` → `app/[province]/[city]/[business]/page.tsx`
- SEO base:
  - `layout.tsx`: `Organization` JSON‑LD, metadata global.
  - City/Province/Business pages: `generateStaticParams`, `generateMetadata`, canonical, OpenGraph/Twitter configurados.
  - `app/sitemap.xml/route.ts`: incluye home, legales, provincias y ciudades.
  - `app/robots.txt/route.ts`: permisivo, referencia a `sitemap.xml`.

---

### 3) Estado SEO actual (hechos)
- Cobertura sólida para intenciones “Mecánicos en {ciudad}” y “Mecánicos {ciudad}” (title, H1, canonical y SSG correctos).
- Fichas de negocio con `LocalBusiness` JSON‑LD.
- Falta en listados: `ItemList` JSON‑LD (mejora de elegibilidad rich results) y `BreadcrumbList` JSON‑LD.
- No existen landings indexables para:
  - “abiertos” (abiertos ahora)
  - “cerca” (near me / orden por distancia)
- `sitemap.xml` no incluye fichas ni variantes “abiertos/cerca”.
- Categorías tipo “gomerías”/“talleres”: datos de scrapeo no son fiables → se pospone su SEO dedicado.

---

### 4) Intenciones de búsqueda objetivo y cobertura
- Cubiertas:
  - “Mecánicos en {ciudad}”, “Mecánicos {ciudad}”.
- Parcial:
  - “Mecánicos cerca”, “Taller cerca” (hoy sólo como orden por distancia, sin landing indexable).
- No cubiertas (aplazadas):
  - “Gomerías {ciudad}”, “Gomerías abiertas/cerca”, “Taller {ciudad}” con páginas propias y contenido específico.

---

### 5) Problemas y riesgos
- Sin landings “abiertos” y “cerca” → pérdida de demanda local de alta intención.
- Listados sin `ItemList`/`BreadcrumbList` → menor elegibilidad a rich results.
- Sitemap incompleto → menor descubrimiento y cobertura.
- Thin content potencial en variantes si hay pocos resultados.
- Datos scrapeados con categorías imprecisas → no depender de clasificación para esta iteración.

---

### 6) Restricciones y decisiones
- No se implementará taxonomía “gomerías/talleres” en esta iteración.
- Se priorizan landings neutrales por ciudad: “abiertos” y “cerca”.
- Se aplican guardas SEO (noindex + exclusión de sitemap) cuando la cobertura es baja.

---

### 7) Plan por iteraciones

#### Iteración A (prioridad 1, objetivo de esta entrega): Landings “abiertos” y “cerca” por ciudad
Cubre consultas: “mecánicos abiertos {ciudad}”, “mecánicos cerca {ciudad}”.

- Rutas a crear:
  - `apps/mechanic-finder/app/[province]/[city]/abiertos/page.tsx`
  - `apps/mechanic-finder/app/[province]/[city]/cerca/page.tsx`

- Generación estática
  - `export const revalidate = 3600` en ambas páginas.
  - `generateStaticParams()` reutilizando la lógica de `app/[province]/[city]/page.tsx` (todas las ciudades activas).

- Data fetching
  - Común: `getProvinceBySlug(provinceSlug)`, `getCityBySlug(citySlug)`.
  - Abiertos: `getBusinesses({ filters: { cityId: city.id, isOpen: true }, pagination, orderBy: { field: 'googleMapsRating', direction: 'desc' } })`.
  - Cerca: determinar `userLocation`:
    - Si hay `searchParams.lat/lng` → usarlos.
    - Si no, usar centroide de la ciudad (`city.latitude/city.longitude`). Si el modelo aún no lo expone, acordar un fallback (p.ej., coordenadas predefinidas) y planificar agregar campos.
    - Llamar `getBusinesses({ filters: { cityId: city.id }, pagination, orderBy: { field: 'distance', direction: 'asc' }, userLocation })`.

- Metadata y canonical
  - Abiertos:
    - Title: “Mecánicos abiertos en {Ciudad} | {N} talleres”.
    - Description: “Encontrá mecánicos abiertos ahora en {Ciudad}, {Provincia}. {N} talleres con horarios y contacto.”
    - Canonical: `/{province}/{city}/abiertos/`.
  - Cerca:
    - Title: “Mecánicos cerca de {Ciudad} | {N} talleres”.
    - Description: “Mecánicos cerca en {Ciudad}, {Provincia}. Ordenados por distancia.”
    - Canonical: `/{province}/{city}/cerca/`.
  - Robots condicional:
    - Si `N < 5` resultados → `noindex,follow` en metadata y excluir del sitemap (threshold configurable).

- H1 y contenido
  - H1 Abiertos: “Mecánicos abiertos en {Ciudad}”.
  - H1 Cerca: “Mecánicos cerca de {Ciudad}”.
  - Texto editorial breve (100–150 palabras) con sinónimos naturales y consejos prácticos. Único por tipo/ciudad (puede componerse con plantillas + variables).

- Datos estructurados (JSON‑LD)
  - `BreadcrumbList` para ambas:
    - Home (`/`) → Provincia (`/{province}/`) → Ciudad (`/{province}/{city}/`) → Abiertos/Cerca.
  - `ItemList` en ambas:
    - `itemListElement`: entries con `position`, `url` a la ficha canónica, `name`, `address`/`telephone` si disponibles.

- Paginación SEO
  - Mantener canonical en la URL paginada actual.
  - Añadir `<link rel="next"/>` y `<link rel="prev"/>` según `pagination`.

- Sitemap
  - Ampliar `app/sitemap.xml/route.ts` para añadir por ciudad:
    - `/{province}/{city}/abiertos/` si `countOpen >= 5`.
    - `/{province}/{city}/cerca/` si `countTotal >= 5`.
  - `lastmod`: `city.updatedAt` o timestamp de cálculo; `changefreq`: weekly; `priority`: conservadora (0.5–0.7).

- Enlaces internos
  - En `app/[province]/[city]/page.tsx` incluir links visibles a “Abiertos” y “Cerca”.

- QA / DoD (Definition of Done)
  - Páginas renderizan SSG con metadata, canonical y robots condicional.
  - H1 y texto editorial presentes; UX con CTA “Usar mi ubicación” en “cerca”.
  - JSON‑LD `BreadcrumbList` y `ItemList` válidos (Rich Results test).
  - Paginación con `rel=next/prev` y canonical correcto.
  - `sitemap.xml` actualizado con threshold.

- Tareas técnicas (checklist)
  - [ ] Crear `app/[province]/[city]/abiertos/page.tsx` con `revalidate`, `generateStaticParams`, `generateMetadata`, renderizado de lista, JSON‑LD y paginación.
  - [ ] Crear `app/[province]/[city]/cerca/page.tsx` con `revalidate`, `generateStaticParams`, `generateMetadata`, soporte `lat/lng`, JSON‑LD y paginación.
  - [ ] Añadir enlaces internos desde `app/[province]/[city]/page.tsx` hacia las dos landings.
  - [ ] Extender `app/sitemap.xml/route.ts` para incluir URLs “abiertos”/“cerca” con threshold.
  - [ ] QA de metadata, canonicals, robots, JSON‑LD y sitemap.


#### Iteración B (opcional, prioridad 2): Categorías “gomerías”/“talleres” por heurística
Objetivo: cubrir búsquedas por tipo sin depender de categorías perfectas (aplazada, no bloquear entregas).

- Señales simples (regex/diccionario sobre `name`/`description`):
  - Gomería: “gomería”, “neumáticos”, “cubiertas”, “balanceo”, “alineación”, marcas (Pirelli, Michelin, Firestone), “llantas”.
  - Taller: “taller”, “mecánica”, “inyección”, “embrague”, “frenos”, “alternador”, “distribución”.
- Scoring y umbral alto (≥2 tokens). Multi‑label permitido; inciertos excluidos.
- Rutas: `/{province}/{city}/gomerias/`, `/talleres/` y variantes `/abiertas/`, `/cerca/`.
- Guardas SEO: noindex y fuera de sitemap si `N < 5` o incierto.
- Canonical hacia `/{province}/{city}/` cuando aplique.


#### Iteración C (prioridad 3): Sitemap index y enriquecimientos
- Pasar a sitemap index (`/sitemap.xml`) que referencie:
  - `sitemap-static.xml` (home/legales), `sitemap-provinces.xml`, `sitemap-cities.xml`.
  - `sitemap-city-variants.xml` (abiertos/cerca; y por tipo si B se implementa).
  - `sitemap-businesses-*.xml` (paginado por volumen; ~10k URL/archivo).
- Añadir OG image dinámica por ciudad/landing (opcional pero recomendable para CTR social).

---

### 8) Recomendaciones de contenido y UX
- Evitar keyword stuffing; usar sinónimos naturales: “taller mecánico”, “servicio mecánico”, “24hs”, “urgencias”.
- Texto editorial breve por landing, con foco en la ciudad y señales de calidad (reseñas, horarios, cercanía).
- Componentes: mantener breadcrumb UI y bloques de “Ciudades relacionadas”/“Zonas cercanas”.
- En “cerca”: botón “Usar mi ubicación” que procura permisos y reconstruye URL con `lat/lng` (sin romper canonical básica de la landing).

---

### 9) Métricas y monitoreo
- GSC: impresiones/CTR/posición para queries “mecánicos abiertos {ciudad}” y “mecánicos cerca {ciudad}”.
- Indexación de nuevas URLs en Cobertura.
- % de ciudades con `N >= 5` (threshold) y evolución.
- Sesiones orgánicas y contactos desde estas landings.

---

### 10) Anexos — referencias útiles
- Archivos clave:
  - `apps/mechanic-finder/app/layout.tsx` (metadata global y `Organization` JSON‑LD).
  - `apps/mechanic-finder/app/[province]/page.tsx` (SSG por provincia).
  - `apps/mechanic-finder/app/[province]/[city]/page.tsx` (SSG por ciudad; patrón a replicar).
  - `apps/mechanic-finder/app/[province]/[city]/[business]/page.tsx` (`LocalBusiness` JSON‑LD).
  - `apps/mechanic-finder/app/sitemap.xml/route.ts` (sitemap actual; extender con variantes).
  - `apps/mechanic-finder/app/robots.txt/route.ts`.

- JSON‑LD (formas esperadas)
  - `BreadcrumbList`: Home → Provincia → Ciudad → Abiertos/Cerca.
  - `ItemList`: entradas de listados con `position`, `url`, `name`, `address`/`telephone` si hay.

---

### 11) Resumen ejecutivo
- Qué haremos ahora (Iteración A): crear landings “abiertos” y “cerca” por ciudad con SSG, metadata, canonical, robots condicional, JSON‑LD (`BreadcrumbList` + `ItemList`), paginación SEO, enlaces internos y sitemap con threshold.
- Qué no haremos (por ahora): páginas por categoría (gomerías/talleres) basadas en datos ruidosos.
- Resultado esperado: mayor cobertura de intenciones locales, mejor descubrimiento vía sitemap, mejor elegibilidad a rich results y mejoras en CTR/posición para consultas “abiertos/cerca”.