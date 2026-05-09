# 🛠️ Guía Paso a Paso - Implementación SEO Mechanic Finder

## 📋 **Lista de Verificación Previa**

### ✅ **Prerequisitos (OBLIGATORIO completar antes de empezar)**

- [ ] **Backup completo del proyecto**
  ```bash
  git checkout -b seo-implementation-backup
  git push origin seo-implementation-backup
  ```

- [ ] **Verificar funciones existentes**
  - [ ] Confirmar que `getBusinesses()` funciona con `filters.isOpen: true`
  - [ ] Confirmar que `orderBy: { field: 'distance' }` funciona
  - [ ] Verificar que PostGIS está configurado correctamente

- [ ] **Testing environment listo**
  - [ ] Base de datos de desarrollo con datos
  - [ ] Next.js development server funcionando
  - [ ] Variables de entorno configuradas

---

## 🎯 **FASE 1: Páginas Críticas (Prioridad Máxima)**

### **PASO 1.1: Crear Página "Abiertos" (Días 1-5)**

#### **Día 1: Estructura base**

1. **Crear archivo base**
   ```bash
   mkdir -p apps/mechanic-finder/app/\[province\]/\[city\]/abiertos
   touch apps/mechanic-finder/app/\[province\]/\[city\]/abiertos/page.tsx
   ```

2. **Copiar estructura desde página ciudad existente**
   ```bash
   # Usar como template:
   # apps/mechanic-finder/app/[province]/[city]/page.tsx
   ```

3. **Implementar estructura básica**
   ```typescript
   // apps/mechanic-finder/app/[province]/[city]/abiertos/page.tsx
   import { Metadata } from 'next';
   import { notFound } from 'next/navigation';
   // ... otros imports
   
   export const revalidate = 3600; // 1 hora
   
   type Props = {
     params: Promise<{ province: string; city: string }>;
     searchParams: Promise<{ page?: string }>;
   };
   ```

#### **Día 2: generateStaticParams**

4. **Implementar generateStaticParams**
   ```typescript
   export async function generateStaticParams() {
     // TODO: Reutilizar lógica exacta de page.tsx principal
     // Obtener todas las combinaciones province/city activas
     try {
       const provinces = await getProvinces();
       const params = [];
       
       for (const province of provinces) {
         for (const city of province.cities) {
           params.push({
             province: province.slug,
             city: city.slug,
           });
         }
       }
       
       return params;
     } catch (error) {
       console.error('Error generating static params for abiertos:', error);
       return [];
     }
   }
   ```

#### **Día 3: Metadata y SEO**

5. **Implementar generateMetadata con conditional indexing**
   ```typescript
   export async function generateMetadata({ params }: Props): Promise<Metadata> {
     const { province: provinceSlug, city: citySlug } = await params;
     
     const [province, city] = await Promise.all([
       getProvinceBySlug(provinceSlug),
       getCityBySlug(citySlug),
     ]);
     
     if (!province || !city) {
       return { title: "Página no encontrada" };
     }
     
     // CRITICAL: Get open businesses count for conditional indexing
     const openCount = await getOpenBusinessesCount(city.id);
     const robots = openCount < 5 ? 'noindex,follow' : 'index,follow';
     
     const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
     
     return {
       title: `Mecánicos abiertos en ${city.name} | ${openCount} talleres disponibles`,
       description: `Encontrá mecánicos abiertos ahora en ${city.name}, ${province.name}. ${openCount} talleres con horarios y contacto directo. Lista actualizada en tiempo real.`,
       keywords: [
         `mecánicos abiertos ${city.name.toLowerCase()}`,
         `talleres abiertos ${city.name.toLowerCase()}`,
         `mecánico ${city.name.toLowerCase()} horarios`,
         `taller mecánico abierto ahora ${city.name.toLowerCase()}`,
       ],
       robots,
       alternates: {
         canonical: `${baseUrl}/${province.slug}/${city.slug}/abiertos/`,
       },
       openGraph: {
         title: `Mecánicos abiertos en ${city.name}`,
         description: `${openCount} talleres mecánicos abiertos ahora en ${city.name}`,
         type: "website",
       },
     };
   }
   ```

#### **Día 4: Data fetching y renderizado**

6. **Implementar component principal**
   ```typescript
   export default async function AbiertosPage({ params, searchParams }: Props) {
     const { province: provinceSlug, city: citySlug } = await params;
     const { page } = await searchParams;
     const currentPage = Number(page) || 1;
     
     const [province, city] = await Promise.all([
       getProvinceBySlug(provinceSlug),
       getCityBySlug(citySlug),
     ]);
     
     if (!province || !city) {
       notFound();
     }
     
     // CRITICAL: Fetch only open businesses
     const { businesses: openMechanics, pagination } = await getBusinesses({
       filters: { 
         cityId: city.id, 
         isOpen: true 
       },
       pagination: { 
         page: currentPage, 
         limit: ITEMS_PER_PAGE 
       },
       orderBy: { 
         field: 'googleMapsRating', 
         direction: 'desc' 
       }
     });
     
     // Breadcrumb structure
     const breadcrumbElements = [
       { id: 'inicio', href: '/', content: 'Inicio' },
       { id: 'provincia', href: `/${province.slug}`, content: province.name },
       { id: 'ciudad', href: `/${province.slug}/${city.slug}`, content: city.name },
       { id: 'abiertos', href: `/${province.slug}/${city.slug}/abiertos`, content: 'Abiertos' },
     ];
     
     return (
       <div className="flex flex-col gap-8">
         <Breadcrumb elements={breadcrumbElements} />
         
         <div className="text-center">
           <h1 className="text-4xl font-bold mb-4">
             Mecánicos abiertos en {city.name}
           </h1>
           <p className="text-xl text-gray-600 mb-8">
             {openMechanics.length} talleres disponibles ahora en {city.name}, {province.name}
           </p>
         </div>
         
         {/* Lista de mecánicos */}
         {openMechanics.length > 0 ? (
           <div className="grid gap-6">
             {openMechanics.map((mechanic) => (
               <MechanicCard key={mechanic.id} mechanic={mechanic} />
             ))}
           </div>
         ) : (
           <EmptyState 
             title="No hay mecánicos abiertos en este momento"
             description="Prueba buscando en otra ciudad o revisa más tarde"
           />
         )}
         
         {/* Paginación */}
         {pagination.pages > 1 && (
           <PaginationBar pagination={pagination} />
         )}
       </div>
     );
   }
   ```

#### **Día 5: JSON-LD y testing**

7. **Agregar JSON-LD estructurado**
   ```typescript
   // Agregar después del breadcrumb
   const jsonLd = {
     "@context": "https://schema.org",
     "@graph": [
       {
         "@type": "BreadcrumbList",
         "itemListElement": breadcrumbElements.map((item, index) => ({
           "@type": "ListItem",
           "position": index + 1,
           "name": item.content,
           "item": `${baseUrl}${item.href}`
         }))
       },
       {
         "@type": "ItemList",
         "itemListElement": openMechanics.map((mechanic, index) => ({
           "@type": "ListItem", 
           "position": index + 1,
           "name": mechanic.name,
           "url": `${baseUrl}/${province.slug}/${city.slug}/${mechanic.slug}`,
           "address": mechanic.address,
           "telephone": mechanic.phone
         }))
       }
     ]
   };
   
   // Agregar al head
   <script
     type="application/ld+json"
     dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
   />
   ```

8. **Testing inicial**
   - [ ] Página renderiza correctamente
   - [ ] Data fetching funciona con `isOpen: true`
   - [ ] Metadata se genera correctamente
   - [ ] JSON-LD válido en Rich Results Test

### **PASO 1.2: Crear Página "Cerca" (Días 6-10)**

#### **Día 6: Estructura base "cerca"**

9. **Crear archivo y estructura base**
   ```bash
   mkdir -p apps/mechanic-finder/app/\[province\]/\[city\]/cerca
   touch apps/mechanic-finder/app/\[province\]/\[city\]/cerca/page.tsx
   ```

10. **Implementar base similar a "abiertos"**
    ```typescript
    // Copiar estructura de abiertos y modificar
    export const revalidate = 3600;
    
    type Props = {
      params: Promise<{ province: string; city: string }>;
      searchParams: Promise<{ page?: string; lat?: string; lng?: string }>;
    };
    ```

#### **Día 7: Geolocation logic**

11. **Implementar lógica de ubicación**
    ```typescript
    export default async function CercaPage({ params, searchParams }: Props) {
      const { province: provinceSlug, city: citySlug } = await params;
      const { page, lat, lng } = await searchParams;
      
      // CRITICAL: Location determination logic
      let userLocation;
      
      if (lat && lng) {
        // Use provided coordinates
        userLocation = {
          latitude: Number(lat),
          longitude: Number(lng)
        };
      } else {
        // Fallback to city centroid
        // TODO: Add city.latitude/longitude to model if not exists
        userLocation = {
          latitude: city.latitude || DEFAULT_CITY_COORDS[city.slug]?.lat || -34.6037,
          longitude: city.longitude || DEFAULT_CITY_COORDS[city.slug]?.lng || -58.3816
        };
      }
      
      const { businesses: nearbyMechanics } = await getBusinesses({
        filters: { cityId: city.id },
        orderBy: { field: 'distance', direction: 'asc' },
        userLocation,
        pagination: { page: currentPage, limit: ITEMS_PER_PAGE }
      });
    ```

#### **Día 8: UI para geolocation**

12. **Implementar botón "Usar mi ubicación"**
    ```typescript
    // Crear componente GeolocationButton
    'use client';
    
    export function GeolocationButton({ currentPath }: { currentPath: string }) {
      const router = useRouter();
      
      const handleUseLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              router.push(`${currentPath}?lat=${latitude}&lng=${longitude}`);
            },
            (error) => {
              console.error('Error getting location:', error);
            }
          );
        }
      };
      
      return (
        <button onClick={handleUseLocation} className="btn-primary">
          📍 Usar mi ubicación
        </button>
      );
    }
    ```

#### **Día 9: Metadata para "cerca"**

13. **Implementar metadata específica**
    ```typescript
    export async function generateMetadata({ params }: Props): Promise<Metadata> {
      // Similar a abiertos pero con content específico
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const totalCount = await getTotalBusinessesCount(city.id);
      const robots = totalCount < 5 ? 'noindex,follow' : 'index,follow';
      
      return {
        title: `Mecánicos cerca de ${city.name} | ${totalCount} talleres por distancia`,
        description: `Mecánicos más cercanos en ${city.name}, ${province.name}. Ordenados por distancia. Encuentra el taller mecánico más conveniente.`,
        robots,
        alternates: {
          canonical: `${baseUrl}/${province.slug}/${city.slug}/cerca/`,
        },
      };
    }
    ```

#### **Día 10: Testing y refinamiento**

14. **Testing completo de geolocation**
    - [ ] Página funciona sin parámetros lat/lng
    - [ ] Página funciona con parámetros lat/lng
    - [ ] Botón geolocation funciona en browser
    - [ ] Ordenamiento por distancia correcto
    - [ ] Fallback a city centroid funciona

### **PASO 1.3: Actualizar Sitemap (Días 11-12)**

#### **Día 11: Implementar threshold logic**

15. **Crear función helper para conteos**
    ```typescript
    // apps/mechanic-finder/actions/business.ts
    export async function getOpenBusinessesCount(cityId: string): Promise<number> {
      // TODO: Implementar conteo de negocios abiertos
      const { businesses } = await getBusinesses({
        filters: { cityId, isOpen: true },
        pagination: { page: 1, limit: 1 }
      });
      
      return businesses.length; // Este será el count real
    }
    
    export async function getTotalBusinessesCount(cityId: string): Promise<number> {
      // TODO: Implementar conteo total
      const { businesses } = await getBusinesses({
        filters: { cityId },
        pagination: { page: 1, limit: 1 }
      });
      
      return businesses.length;
    }
    ```

16. **Extender sitemap.xml/route.ts**
    ```typescript
    // Modificar apps/mechanic-finder/app/sitemap.xml/route.ts
    
    export async function GET(): Promise<Response> {
      const provinces = await prisma.province.findMany({
        where: { status: true },
        include: {
          cities: { where: { status: true } }
        }
      });
      
      const urls = [
        // ... URLs existentes
      ];
      
      // Add province and city routes WITH new variants
      for (const province of provinces) {
        // Province route
        urls.push({
          loc: `${baseUrl}/${province.slug}/`,
          lastmod: province.updatedAt.toISOString(),
          changefreq: 'weekly',
          priority: '0.8',
        });
        
        for (const city of province.cities) {
          // Base city route
          urls.push({
            loc: `${baseUrl}/${province.slug}/${city.slug}/`,
            lastmod: city.updatedAt.toISOString(),
            changefreq: 'weekly',
            priority: '0.6',
          });
          
          // CRITICAL: Add conditional variants
          const [openCount, totalCount] = await Promise.all([
            getOpenBusinessesCount(city.id),
            getTotalBusinessesCount(city.id)
          ]);
          
          // Abiertos route (only if ≥5 open businesses)
          if (openCount >= 5) {
            urls.push({
              loc: `${baseUrl}/${province.slug}/${city.slug}/abiertos/`,
              lastmod: city.updatedAt.toISOString(),
              changefreq: 'weekly',
              priority: '0.5',
            });
          }
          
          // Cerca route (only if ≥5 total businesses)
          if (totalCount >= 5) {
            urls.push({
              loc: `${baseUrl}/${province.slug}/${city.slug}/cerca/`,
              lastmod: city.updatedAt.toISOString(),
              changefreq: 'weekly',
              priority: '0.5',
            });
          }
        }
      }
      
      // Generate XML (mismo formato existente)
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.map(url => `
      <url>
        <loc>${url.loc}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
      </url>`).join('')}
    </urlset>`;
      
      return new Response(xml, {
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }
    ```

#### **Día 12: Testing sitemap**

17. **Validar sitemap**
    - [ ] Sitemap genera sin errores
    - [ ] URLs nuevas aparecen solo cuando threshold ≥5
    - [ ] XML es válido
    - [ ] Performance de generación aceptable

### **PASO 1.4: Enlaces Internos (Día 13)**

#### **Día 13: Modificar página ciudad principal**

18. **Agregar CTAs en city page**
    ```typescript
    // Modificar apps/mechanic-finder/app/[province]/[city]/page.tsx
    
    // Agregar después del header, antes de la lista
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Link href={`/${province.slug}/${city.slug}/abiertos/`}>
        <div className="border rounded-lg p-6 hover:bg-gray-50 hover:border-primary-cta transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold text-lg">Mecánicos Abiertos Ahora</h3>
          </div>
          <p className="text-gray-600">
            Ver talleres disponibles en este momento con horarios actualizados
          </p>
        </div>
      </Link>
      
      <Link href={`/${province.slug}/${city.slug}/cerca/`}>
        <div className="border rounded-lg p-6 hover:bg-gray-50 hover:border-primary-cta transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold text-lg">Mecánicos Más Cercanos</h3>
          </div>
          <p className="text-gray-600">
            Ordenados por distancia a tu ubicación para mayor conveniencia
          </p>
        </div>
      </Link>
    </div>
    ```

### **PASO 1.5: QA Completo (Días 14-15)**

#### **Día 14: Testing funcional**

19. **Checklist QA funcional**
    - [ ] Páginas "abiertos" renderizan correctamente
    - [ ] Páginas "cerca" renderizan correctamente  
    - [ ] Data fetching funciona (isOpen filter)
    - [ ] Geolocation funciona
    - [ ] Paginación funciona
    - [ ] Enlaces internos funcionan

#### **Día 15: Testing SEO**

20. **Checklist QA SEO**
    - [ ] Metadata correcta en todas las páginas
    - [ ] Canonical URLs correctas
    - [ ] Robots conditional indexing funciona
    - [ ] JSON-LD válido (Rich Results Test)
    - [ ] Sitemap XML válido
    - [ ] Breadcrumbs funcionan

---

## 📊 **Checkpoint Fase 1 Completa**

### **Al finalizar los 15 días, deberías tener:**

✅ **URLs funcionando**:
- `/{provincia}/{ciudad}/abiertos/` - Con conditional indexing
- `/{provincia}/{ciudad}/cerca/` - Con geolocation support

✅ **SEO implementado**:
- Metadata optimizada por página
- JSON-LD BreadcrumbList + ItemList
- Sitemap actualizado con threshold logic

✅ **UX mejorada**:
- Enlaces internos desde city pages
- Botón geolocation en páginas "cerca"
- Empty states cuando no hay resultados

### **Métricas a monitorear inmediatamente**:
- Indexación en Google Search Console
- Errores de crawling
- Performance de nuevas páginas

---

## 🚀 **Próximo: FASE 2 (Cuando Fase 1 esté estable)**

Una vez que Fase 1 esté funcionando perfectamente y se vean resultados iniciales:

1. **Implementar páginas "talleres"** (variaciones terminológicas)
2. **Crear variantes combinadas** (`/talleres/abiertos/`, `/talleres/cerca/`)
3. **Optimizar rich snippets** y featured snippets
4. **Implementar sitemap index** para escalar

**Tiempo estimado Fase 2**: 1-2 semanas adicionales  
**Incremento adicional esperado**: +15-25% tráfico orgánico

---

## ⚠️ **Notas Importantes**

### **Funciones que necesitas verificar existen**:
- `getOpenBusinessesCount(cityId: string)`
- `getTotalBusinessesCount(cityId: string)`
- City model con `latitude` y `longitude` fields
- `DEFAULT_CITY_COORDS` constant si no hay coords en DB

### **Si algo no existe, crear primero**:
1. Implementar funciones de conteo
2. Agregar campos de coordenadas a City model
3. Crear constants file para fallback coordinates

### **Performance considerations**:
- Sitemap generation puede ser lenta con muchas ciudades
- Considerar caching para conteos de businesses
- Monitor memory usage durante static generation 