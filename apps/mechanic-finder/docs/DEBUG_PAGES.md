# 🔒 Debug Pages - Best Practices

Este documento describe cómo manejar páginas de debug de forma segura en la aplicación.

## 📋 Páginas de Debug Actuales

- `/analytics-test` - Testing de Google Analytics
- `/adsense-debug` - Debugging de Google AdSense

## 🛡️ Protecciones Implementadas

### 1. Environment-based Protection
```typescript
// En production: 404 automático
if (process.env.NODE_ENV === 'production') {
  return NextResponse.rewrite(new URL('/404', request.url));
}
```

### 2. Middleware Protection
- Bloquea automáticamente en producción
- Middleware en `apps/mechanic-finder/middleware.ts`
- Aplica a todas las rutas de debug

### 3. DebugWrapper Component
- Wrapper universal para páginas de debug
- Auto-hide en production
- Opcional: require debug key

## 🔧 Configuración

### Variables de Entorno (Opcional)
```bash
# .env.local
DEBUG_KEY="tu-clave-secreta"
```

### Uso del DebugWrapper
```typescript
import { DebugWrapper } from '@/components/Debug/DebugWrapper';

export default function MyDebugPage() {
  return (
    <DebugWrapper title="My Debug Page" requireKey={false}>
      {/* Tu contenido de debug */}
    </DebugWrapper>
  );
}
```

## ✅ Beneficios

### ✅ Seguridad
- **Nunca visible en production**
- **No crawleable por bots**
- **No indexable por Google**

### ✅ Desarrollo
- **Fácil acceso en development**
- **Información sensible protegida**
- **Debug keys opcionales**

### ✅ Performance
- **Zero overhead en production**
- **No impacto en bundle size**
- **No rutas expuestas**

## 🚀 Alternativas

### Opción 1: Feature Flags
```typescript
const showDebugPages = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';
```

### Opción 2: Admin Routes
```
/admin/debug/analytics
/admin/debug/adsense
```

### Opción 3: IP Whitelist
```typescript
const allowedIPs = ['127.0.0.1', '::1'];
if (!allowedIPs.includes(clientIP)) return 404;
```

## 📊 Recomendaciones Finales

### ✅ DO:
- ✅ Usar `DebugWrapper` para nuevas páginas
- ✅ Mantener protección en middleware
- ✅ Documentar páginas de debug
- ✅ Revisar logs de producción

### ❌ DON'T:
- ❌ Hardcodear credenciales
- ❌ Exponer APIs en debug pages
- ❌ Dejar debug pages sin protección
- ❌ Incluir en sitemap o robots.txt

## 🔍 Testing

### Development:
```bash
# Accesible
http://localhost:3000/analytics-test
http://localhost:3000/adsense-debug
```

### Production:
```bash
# Debe retornar 404
https://tu-sitio.com/analytics-test
https://tu-sitio.com/adsense-debug
```

---

**Última actualización:** Enero 2025
**Responsable:** Team Dev