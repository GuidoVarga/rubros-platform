import { prisma } from '../../client';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { createReadStream } from 'fs';
import { Business } from '../../generated/prisma';
import streamArray from 'stream-json/streamers/StreamArray.js';
import streamValues from 'stream-json/streamers/StreamValues.js';
import parser from 'stream-json';

// Obtener __dirname en módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Función para parsear argumentos de línea de comandos
function parseArguments(): {
  filePath: string;
  categorySlug: string;
  countryCode: string;
} {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error(
      '❌ Uso: node script.js <archivo.json> <categoria-slug> [codigo-pais]'
    );
    console.error('📝 Ejemplo: node script.js data.json mecanicos AR');
    console.error(
      '📝 Ejemplo: node script.js data.json mecanicos (usa AR por defecto)'
    );
    process.exit(1);
  }

  const [filePath, categorySlug, countryCode = 'AR'] = args;

  return { filePath, categorySlug, countryCode };
}

// Tabla de equivalencias para provincias por país
const provinceLookup: Record<
  string,
  Record<string, { name: string; slug: string }>
> = {
  AR: {
    'buenos aires': { name: 'Buenos Aires', slug: 'buenos-aires' },
    'provincia de buenos aires': { name: 'Buenos Aires', slug: 'buenos-aires' },
    'santa fe': { name: 'Santa Fe', slug: 'santa-fe' },
    'capital federal': { name: 'Capital Federal', slug: 'capital-federal' },
    'cdad. autonoma de buenos aires': {
      name: 'Capital Federal',
      slug: 'capital-federal',
    },
    'ciudad autonoma de buenos aires': {
      name: 'Capital Federal',
      slug: 'capital-federal',
    },
    caba: { name: 'Capital Federal', slug: 'capital-federal' },
    cordoba: { name: 'Córdoba', slug: 'cordoba' },
    'santa cruz': { name: 'Santa Cruz', slug: 'santa-cruz' },
    'la pampa': { name: 'La Pampa', slug: 'la-pampa' },
    'entre rios': { name: 'Entre Ríos', slug: 'entre-rios' },
    chubut: { name: 'Chubut', slug: 'chubut' },
    neuquen: { name: 'Neuquén', slug: 'neuquen' },
    'rio negro': { name: 'Río Negro', slug: 'rio-negro' },
    'tierra del fuego': { name: 'Tierra del Fuego', slug: 'tierra-del-fuego' },
    formosa: { name: 'Formosa', slug: 'formosa' },
    jujuy: { name: 'Jujuy', slug: 'jujuy' },
    salta: { name: 'Salta', slug: 'salta' },
    mendoza: { name: 'Mendoza', slug: 'mendoza' },
    misiones: { name: 'Misiones', slug: 'misiones' },
    corrientes: { name: 'Corrientes', slug: 'corrientes' },
    'la rioja': { name: 'La Rioja', slug: 'la-rioja' },
    'san juan': { name: 'San Juan', slug: 'san-juan' },
    catamarca: { name: 'Catamarca', slug: 'catamarca' },
    'santiago del estero': {
      name: 'Santiago del Estero',
      slug: 'santiago-del-estero',
    },
    tucuman: { name: 'Tucumán', slug: 'tucuman' },
    'san luis': { name: 'San Luis', slug: 'san-luis' },
    chaco: { name: 'Chaco', slug: 'chaco' },
  },
};

// Tabla de equivalencias para barrios de CABA
const barriosCABALookup: Record<string, { name: string; slug: string }> = {
  agronomia: { name: 'Agronomía', slug: 'agronomia' },
  almagro: { name: 'Almagro', slug: 'almagro' },
  balvanera: { name: 'Balvanera', slug: 'balvanera' },
  barracas: { name: 'Barracas', slug: 'barracas' },
  belgrano: { name: 'Belgrano', slug: 'belgrano' },
  boedo: { name: 'Boedo', slug: 'boedo' },
  caballito: { name: 'Caballito', slug: 'caballito' },
  chacarita: { name: 'Chacarita', slug: 'chacarita' },
  coghlan: { name: 'Coghlan', slug: 'coghlan' },
  colegiales: { name: 'Colegiales', slug: 'colegiales' },
  constitucion: { name: 'Constitución', slug: 'constitucion' },
  constitución: { name: 'Constitución', slug: 'constitucion' },
  flores: { name: 'Flores', slug: 'flores' },
  floresta: { name: 'Floresta', slug: 'floresta' },
  'la boca': { name: 'La Boca', slug: 'la-boca' },
  'la paternal': { name: 'La Paternal', slug: 'la-paternal' },
  liniers: { name: 'Liniers', slug: 'liniers' },
  mataderos: { name: 'Mataderos', slug: 'mataderos' },
  'monte castro': { name: 'Monte Castro', slug: 'monte-castro' },
  monserrat: { name: 'Monserrat', slug: 'monserrat' },
  'nueva pompeya': { name: 'Nueva Pompeya', slug: 'nueva-pompeya' },
  nunez: { name: 'Núñez', slug: 'nunez' },
  núñez: { name: 'Núñez', slug: 'nunez' },
  palermo: { name: 'Palermo', slug: 'palermo' },
  'parque avellaneda': { name: 'Parque Avellaneda', slug: 'parque-avellaneda' },
  'parque chacabuco': { name: 'Parque Chacabuco', slug: 'parque-chacabuco' },
  'parque patricios': { name: 'Parque Patricios', slug: 'parque-patricios' },
  'puerto madero': { name: 'Puerto Madero', slug: 'puerto-madero' },
  recoleta: { name: 'Recoleta', slug: 'recoleta' },
  retiro: { name: 'Retiro', slug: 'retiro' },
  saavedra: { name: 'Saavedra', slug: 'saavedra' },
  'san cristobal': { name: 'San Cristóbal', slug: 'san-cristobal' },
  'san cristóbal': { name: 'San Cristóbal', slug: 'san-cristobal' },
  'san nicolas': { name: 'San Nicolás', slug: 'san-nicolas' },
  'san nicolás': { name: 'San Nicolás', slug: 'san-nicolas' },
  'san telmo': { name: 'San Telmo', slug: 'san-telmo' },
  'velez sarsfield': { name: 'Vélez Sarsfield', slug: 'velez-sarsfield' },
  'vélez sarsfield': { name: 'Vélez Sarsfield', slug: 'velez-sarsfield' },
  versalles: { name: 'Versalles', slug: 'versalles' },
  'villa crespo': { name: 'Villa Crespo', slug: 'villa-crespo' },
  'villa del parque': { name: 'Villa del Parque', slug: 'villa-del-parque' },
  'villa devoto': { name: 'Villa Devoto', slug: 'villa-devoto' },
  'villa general mitre': {
    name: 'Villa General Mitre',
    slug: 'villa-general-mitre',
  },
  'villa lugano': { name: 'Villa Lugano', slug: 'villa-lugano' },
  'villa luro': { name: 'Villa Luro', slug: 'villa-luro' },
  'villa ortuzar': { name: 'Villa Ortúzar', slug: 'villa-ortuzar' },
  'villa ortúzar': { name: 'Villa Ortúzar', slug: 'villa-ortuzar' },
  'villa pueyrredon': { name: 'Villa Pueyrredón', slug: 'villa-pueyrredon' },
  'villa pueyrredón': { name: 'Villa Pueyrredón', slug: 'villa-pueyrredon' },
  'villa real': { name: 'Villa Real', slug: 'villa-real' },
  'villa riachuelo': { name: 'Villa Riachuelo', slug: 'villa-riachuelo' },
  'villa santa rita': { name: 'Villa Santa Rita', slug: 'villa-santa-rita' },
  'villa soldati': { name: 'Villa Soldati', slug: 'villa-soldati' },
  'villa urquiza': { name: 'Villa Urquiza', slug: 'villa-urquiza' },
};

// Identificar provincias que requieren procesamiento de barrios (CABA)
const cabaProvinces = [
  'capital federal',
  'cdad. autonoma de buenos aires',
  'ciudad autonoma de buenos aires',
];

// Whitelist de ciudades que tienen números válidos en su nombre
const CpaCodeLookup = {
  B1611BWT: 'Don Torcuato',
  P3600HWA: 'Formosa',
  P3600HWB: 'Formosa',
  P3600HWC: 'Formosa',
  P3600HWD: 'Formosa',
  P3600HWE: 'Formosa',
  P3600HWF: 'Formosa',
  P3600HWG: 'Formosa',
  P3600HWH: 'Formosa',
  P3600HWI: 'Formosa',
  P3600HWJ: 'Formosa',
  P3600HWK: 'Formosa',
  P3600HWL: 'Formosa',
  P3600HWM: 'Formosa',
  P3600HWN: 'Formosa',
  P3600HWO: 'Formosa',
  P3600HWP: 'Formosa',
  P3600HWQ: 'Formosa',
  P3600HWR: 'Formosa',
  P3600HWS: 'Formosa',
  P3600HWT: 'Formosa',
  P3600HWU: 'Formosa',
  P3600HWV: 'Formosa',
  P3600HWW: 'Formosa',
  P3600HWX: 'Formosa',
  P3600HWY: 'Formosa',
  P3600HWZ: 'Formosa',
  P3600HXA: 'Formosa',
  P3600HXB: 'Formosa',
  P3600HXC: 'Formosa',
  P3600HXD: 'Formosa',
  P3600HXF: 'Formosa',
  P3600HXG: 'Formosa',
  P3600HXH: 'Formosa',
  P3600HXI: 'Formosa',
  P3600HXJ: 'Formosa',
  P3600HXK: 'Formosa',
  P3600HXL: 'Formosa',
  P3600HXM: 'Formosa',
  P3600HXN: 'Formosa',
  P3600HXO: 'Formosa',
  P3600HXP: 'Formosa',
  P3600HXQ: 'Formosa',
  P3600HXR: 'Formosa',
  P3600HXS: 'Formosa',
  P3600HXT: 'Formosa',
  P3600HXU: 'Formosa',
  P3600HXV: 'Formosa',
  Q8300APZ: 'Neuquén',
  Q8300BQL: 'Neuquén',
  Q8300IZS: 'Neuquén',
  Q8302GYC: 'Neuquén',
  S3002BZS: 'San Luis',
  S3002CEP: 'San Luis',
  S3002DYJ: 'San Luis',
  S3004ACN: 'San Luis',
  S3004GPB: 'San Luis',
  S3004KMG: 'San Luis',
  S3006EXZ: 'San Luis',
  S3006FPP: 'San Luis',
  V9410ISE: 'Río Grande',
  V9410JIK: 'Río Grande',
  W3400ADN: 'Resistencia',
  W3410BAX: 'Resistencia',
  X5004AER: 'Santa Fe de La Vera Cruz',
};

// Whitelist de ciudades que tienen números válidos en su nombre
const cityNumberWhitelist = [
  '25 de mayo',
  // Agregar más ciudades aquí según sea necesario
];

// ✅ Whitelists de categorías por categorySlug de nuestra BD
const categoryWhitelists: Record<string, string[]> = {
  'mecanicos': [
    "Taller mecanico",
    "Taller de reparacion de automoviles",
    "Taller de automoviles",
    "Taller de chapa y pintura",
    "Taller de reparacion de motos",
    "Tienda de repuestos para automovil",
    "Tienda de neumaticos",
    "Servicio de cambio de aceite",
    "Taller de revision de automoviles",
    "Taller de frenos",
    "Taller de reparacion de vehiculos todoterreno",
    "Servicio de reacondicionamiento de motores",
    "Servicio de alineacion de ruedas",
    "Servicio de reparacion de sistemas electricos para automoviles",
    "Taller de reparaciones electricas",
    "Tienda de repuestos para motos",
    "Tienda de repuestos de automoviles usados",
    "Servicio de reparacion de aire acondicionado",
    "Proveedor de repuestos de carroceria de automoviles",
    "Planchista",
    "Taller de reparacion de motores diesel",
    "Tienda de accesorios para automoviles",
    "Tienda de repuestos para coches de carreras",
    "Servicio de grua",
    "Servicio de chapa y pintura",
    "Tienda de baterias para automovil",
    "Taller de amortiguadores",
    "Servicio de remolque",
    "Tienda de piezas de automovil",
    "Taller de reparacion de tractores",
    "Desguace",
    "Taller de reparacion de autocaravanas",
    "Servicio de reparacion de motores de baja potencia",
    "Servicio de restauracion de automoviles",
    "Tienda de ruedas",
    "Tienda de transmisiones",
    "Taller de cristales para automoviles",
    "Proveedor de alarmas de coche",
    "Fabricante de repuestos para automoviles",
    "Pintura de automoviles",
    "Taller de reparacion de motores electricos",
    "Inspeccion tecnica de vehiculos",
    "Servicio de reparacion de radiadores de automoviles",
    "Servicio de reparacion de radiadores",
    "Tienda de radiadores",
    "Servicio de polarizacion de ventanas",
    "Tienda de automovilismo",
    "Servicio de reparacion de sistemas hidraulicos",
    "Servicio de reparacion de maquinaria agricola",
    "Automocion",
    "Servicio de reparacion de parabrisas y pantallas",
    "Servicio de reparacion de cortadoras de cesped",
    "Taller de reparacion de escuteres",
    "Fabricante de remolques",
    "Servicio de reparacion de compresores de aire",
    "Tapiceria para automoviles",
    "Auto air conditioning service",
    "Chapisteria",
    "Club automovilistico",
    "Contratista mecanico",
    "Taller de reparacion de remolques",
    "Tienda de neumaticos usados",
    "Taller de camiones",
    "Tienda de accesorios para camiones",
    "Taller de reparacion de herramientas",
    "Tienda de ejes de transmision",
    "Tienda de silenciadores"
  ],
  // ✅ Aquí se pueden agregar más categorías en el futuro:
  // 'plomeros': [...],
  // 'electricistas': [...],
};

// ✅ Función helper para validar categorías del negocio
function hasValidCategory(businessCategories: string[] | undefined, allowedCategories: string[]): boolean {
  if (!businessCategories || !Array.isArray(businessCategories) || businessCategories.length === 0) {
    return false;
  }

  return businessCategories.some(category => 
    allowedCategories.includes(category.trim())
  );
}

interface BusinessData {
  name: string;
  description: string;
  email: string;
  image: string;
  category: string;
  categories?: string[]; // ✅ Agregar campo categories
  detailed_address?: {
    street?: string;
    city?: string;
    state?: string;
    country_code?: string;
    ward?: string;
  };
  postal_code?: string;
  opening_hours?: string;
  hours?: string;
  google_maps_link?: string;
  closed_on?: string[];
  is_open?: boolean;
  is_closed?: boolean;
  address?: string;
  phone?: string;
  website?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  rating?: number;
  reviews?: number;
  link?: string;
  place_id?: string;
}

// Validación ligera sin dependencias externas
function validateBusiness(business: any): business is BusinessData {
  return (
    typeof business === 'object' &&
    business !== null &&
    typeof business.name === 'string' &&
    business.name.trim().length > 0
  );
}

// Función helper para buscar barrios de CABA
function findCABABarrio(
  cityName: string
): { name: string; slug: string } | null {
  if (!cityName) return null;

  const lowerCityName = cityName.toLowerCase();

  // Intentar coincidencia exacta primero
  let normalizedBarrio = barriosCABALookup[lowerCityName];

  // Si no hay coincidencia exacta, intentar búsqueda por substring
  if (!normalizedBarrio) {
    // Ordenar por longitud descendente para coincidir con nombres más largos primero
    const sortedBarrios = Object.keys(barriosCABALookup).sort(
      (a, b) => b.length - a.length
    );

    for (const barrioKey of sortedBarrios) {
      if (lowerCityName.includes(barrioKey)) {
        normalizedBarrio = barriosCABALookup[barrioKey];
        break;
      }
    }
  }

  return normalizedBarrio || null;
}

// Función helper para buscar códigos CPA
function findCPACode(cityName: string): string | null {
  if (!cityName) return null;

  // Buscar coincidencia exacta en CpaCodeLookup
  const foundCity = CpaCodeLookup[cityName as keyof typeof CpaCodeLookup];
  return foundCity || null;
}

// Validación de calidad de datos para ciudades
function validateCityName(cityName: string, isCABA: boolean = false): boolean {
  if (!cityName || typeof cityName !== 'string') {
    return false;
  }

  const trimmedName = cityName.trim();

  // Debe tener más de 3 letras
  if (trimmedName.length <= 3) {
    return false;
  }

  // Si contiene números, verificar múltiples opciones
  if (/\d/.test(trimmedName)) {
    // 1. Verificar si es un código CPA válido
    if (findCPACode(trimmedName)) {
      return true;
    }

    // 2. Si es CABA, verificar si es un barrio válido
    if (isCABA && findCABABarrio(trimmedName)) {
      return true;
    }

    // 3. Si no es CABA, verificar si está en la whitelist
    if (!isCABA) {
      const lowerCityName = trimmedName.toLowerCase();
      return cityNumberWhitelist.some(
        (city) => city.toLowerCase() === lowerCityName
      );
    }

    // Si no coincide con ninguna opción, rechazar
    return false;
  }

  return true;
}

type ProcessedBusiness = Omit<
  Business,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'city'
  | 'cityId'
  | 'category'
  | 'categoryId'
> & {
  cityId?: string;
  categoryId?: string;
};

type ProcessedBusinessWithKey = ProcessedBusiness & {
  cityKey: string; // Key temporal para mapear después
  categories?: string[]; // ✅ Preservar categorías originales
};

// Configuración optimizada para volúmenes masivos
const CONFIG = {
  BATCH_SIZE: 5000, // Batches más grandes para mejor rendimiento
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  MEMORY_THRESHOLD: 100000, // Liberar memoria cada 100k registros
  PROGRESS_INTERVAL: 10000, // Mostrar progreso cada 10k registros
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks para lectura de archivos
};

class MemoryManager {
  private processedCount = 0;
  private readonly threshold: number;
  private gcAvailable: boolean;

  constructor(threshold: number = CONFIG.MEMORY_THRESHOLD) {
    this.threshold = threshold;
    this.gcAvailable = typeof global.gc === 'function';

    if (!this.gcAvailable) {
      console.warn(
        '⚠️  Para mejor rendimiento, ejecutá con --expose-gc para habilitar recolección manual de basura.'
      );
    }
  }

  async checkAndCleanup(): Promise<void> {
    this.processedCount++;

    if (this.processedCount % this.threshold === 0) {
      if (this.gcAvailable) {
        (global as any).gc();
        console.log(
          `🧹 Limpieza de memoria ejecutada (${this.processedCount} registros procesados)`
        );
      }

      // Mostrar uso de memoria actual
      const memUsage = process.memoryUsage();
      console.log(
        `📊 Memoria: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB usados`
      );
    }
  }

  getProcessedCount(): number {
    return this.processedCount;
  }
}

class ProgressTracker {
  private startTime: number;
  private lastUpdate: number = 0;
  private processedCount: number = 0;
  private readonly total: number;
  private readonly interval: number;

  constructor(total: number, interval: number = CONFIG.PROGRESS_INTERVAL) {
    this.total = total;
    this.interval = interval;
    this.startTime = Date.now();
  }

  update(processed: number): void {
    this.processedCount = processed;

    if (
      processed - this.lastUpdate >= this.interval ||
      processed === this.total
    ) {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const rate = processed / elapsed;
      const eta = this.total > processed ? (this.total - processed) / rate : 0;
      const percentage = ((processed / this.total) * 100).toFixed(1);

      console.log(
        `📊 Progreso: ${processed.toLocaleString()}/${this.total.toLocaleString()} (${percentage}%) - ${rate.toFixed(0)} reg/s - ETA: ${eta.toFixed(0)}s`
      );
      this.lastUpdate = processed;
    }
  }

  finish(): void {
    const totalTime = (Date.now() - this.startTime) / 1000;
    const avgRate = this.processedCount / totalTime;

    console.log(
      `✅ Completado: ${this.processedCount.toLocaleString()} registros en ${totalTime.toFixed(2)}s (${avgRate.toFixed(0)} reg/s)`
    );
  }
}

// Contador de objetos JSON para debugging
class JSONCounter extends Transform {
  private count = 0;

  constructor() {
    super({ objectMode: true });
  }

  _transform(chunk: any, encoding: string, callback: Function): void {
    this.count++;

    // Log cada 10k objetos para monitorear
    if (this.count % 10000 === 0) {
      console.log(`📊 Objetos JSON procesados: ${this.count.toLocaleString()}`);
    }

    this.push(chunk);
    callback();
  }

  getCount(): number {
    return this.count;
  }
}

async function executeWithTransaction<T>(
  operation: () => Promise<T>
): Promise<T> {
  const maxRetries = CONFIG.MAX_RETRIES;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(operation, {
        timeout: 60000, // 60 segundos timeout
        isolationLevel: 'ReadCommitted',
      });
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        console.warn(
          `⚠️  Intento ${attempt}/${maxRetries} falló, reintentando en ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

async function bulkCreateCities(
  citiesToCreate: Array<{ name: string; slug: string; provinceId: string }>,
  cityMap: Map<string, string>
): Promise<void> {
  if (citiesToCreate.length === 0) return;

  try {
    console.log(`🏗️  Creando ${citiesToCreate.length} ciudades...`);

    // Crear ciudades en chunks para evitar límites de SQL
    const chunkSize = 1000;
    const chunks = [];

    for (let i = 0; i < citiesToCreate.length; i += chunkSize) {
      chunks.push(citiesToCreate.slice(i, i + chunkSize));
    }

    for (const [index, chunk] of chunks.entries()) {
      console.log(
        `📦 Procesando chunk ${index + 1}/${chunks.length} de ciudades...`
      );

      const createdCities = await executeWithTransaction(async () => {
        return await prisma.city.createManyAndReturn({
          data: chunk,
          skipDuplicates: true,
        });
      });

      // Actualizar el mapa con las ciudades creadas
      createdCities.forEach((city) => {
        const key = `${city.slug}|${city.provinceId}`;
        cityMap.set(key, city.id);
      });
    }

    console.log(`✔ Ciudades creadas exitosamente`);
  } catch (error) {
    console.error('❌ Error en creación masiva de ciudades:', error);
    throw error;
  }
}

async function bulkCreateBusinesses(
  businesses: ProcessedBusiness[],
  batchNumber: number,
  slugToCategoriesMap: Map<string, string[]>, // ✅ Mapeo de slug → categorías originales
  categoryTracker: Map<string, number> // ✅ Tracker global de categorías
): Promise<{ sent: number; created: number; skipped: number }> {
  if (businesses.length === 0) return { sent: 0, created: 0, skipped: 0 };

  try {
    const result = await executeWithTransaction(async () => {
      return await prisma.business.createManyAndReturn({
        //@ts-expect-error TODO: fix this
        data: businesses,
        skipDuplicates: true,
      });
    });

    // ✅ Contar categorías de negocios creados exitosamente
    for (const createdBusiness of result) {
      const originalCategories = slugToCategoriesMap.get(createdBusiness.slug);
      if (originalCategories) {
        for (const category of originalCategories) {
          const currentCount = categoryTracker.get(category) || 0;
          categoryTracker.set(category, currentCount + 1);
        }
      }
    }

    const sent = businesses.length;
    const created = result.length;
    const skipped = sent - created;

    if (skipped > 0) {
      console.log(
        `📦 Batch ${batchNumber}: ${created} creados, ${skipped} omitidos (ya existían)`
      );
    }

    return { sent, created, skipped };
  } catch (error) {
    console.error(`❌ Error en batch ${batchNumber}:`, error);
    throw error;
  }
}

async function validateCategory(categorySlug: string): Promise<string> {
  console.log(`🔍 Buscando categoría: ${categorySlug}`);

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, name: true },
  });

  if (!category) {
    throw new Error(`❌ Categoría no encontrada: ${categorySlug}`);
  }

  console.log(`✅ Categoría encontrada: ${category.name} (ID: ${category.id})`);
  return category.id;
}

async function processStreamingData(
  filePath: string,
  categoryId: string,
  categorySlug: string,
  countryCode: string
): Promise<void> {
  const memoryManager = new MemoryManager();
  const fileStats = await fs.stat(filePath);
  console.log(`📁 Archivo: ${(fileStats.size / 1024 / 1024).toFixed(2)} MB`);

  // Cargar datos de referencia
  console.log('🏛️  Cargando provincias...');
  const provinces = await prisma.province.findMany();
  const provinceMap = new Map<string, string>();

  for (const p of provinces) {
    provinceMap.set(p.slug, p.id);
  }

  console.log('🏙️  Cargando ciudades existentes...');
  const existingCities = await prisma.city.findMany({
    select: { id: true, slug: true, provinceId: true },
  });

  const cityMap = new Map<string, string>();
  for (const city of existingCities) {
    const key = `${city.slug}|${city.provinceId}`;
    cityMap.set(key, city.id);
  }

  // Sets para tracking de ciudades y negocios únicos
  const uniqueCities = new Set<string>();
  const businessBatch: ProcessedBusinessWithKey[] = [];
  const citiesToCreate: Array<{
    name: string;
    slug: string;
    provinceId: string;
  }> = [];
  // ✅ Track slugs + addresses en este batch: Map<slugBase, Map<address, assignedNumber>>
  const processedBusinessSlugs = new Map<string, Map<string, number>>();
  
  // ✅ Tracking de categorías
  const categoryTracker = new Map<string, number>(); // Contador global de categorías
  const slugToCategoriesMap = new Map<string, string[]>(); // Mapeo slug → categorías originales

  let totalProcessed = 0;
  let batchNumber = 0;
  let skippedCount = 0;
  let progressTracker: ProgressTracker;

  // Contadores detallados globales
  const skipReasons = {
    invalidStructure: 0,
    missingLocation: 0,
    invalidCityLength: 0,
    invalidCityNumbers: 0,
    unknownProvince: 0,
    provinceNotInDB: 0,
    wrongCountry: 0,
    unknownBarrioCABA: 0,
    duplicatedBusiness: 0, // ✅ Contador para duplicados (mismo slug + misma dirección)
    invalidCategory: 0, // ✅ Contador para negocios sin categorías válidas
    skippedByDatabase: 0, // ✅ Será actualizado al final con totalSkippedByDB
    acceptedByWhitelist: 0, // ✅ Nuevo contador para ciudades aceptadas por whitelist
    acceptedByCPA: 0, // ✅ Nuevo contador para ciudades resueltas via CPA codes
    unknownProvinces: new Set<string>(),
    wrongCountries: new Set<string>(),
    invalidCities: new Set<string>(),
    unknownBarriosCABA: new Set<string>(),
    duplicatedSlugs: new Set<string>(), // ✅ Track slugs base con direcciones duplicadas
    whitelistCities: new Set<string>(), // ✅ Track ciudades aceptadas por whitelist
    cpaCities: new Set<string>(), // ✅ Track ciudades resueltas via CPA codes
    invalidCategories: new Set<string>(), // ✅ Track categorías no válidas encontradas
    examples: {
      invalidStructure: [] as any[],
      missingLocation: [] as any[],
      invalidCityLength: [] as any[],
      invalidCityNumbers: [] as any[],
      unknownProvince: [] as any[],
      provinceNotInDB: [] as any[],
      wrongCountry: [] as any[],
      unknownBarrioCABA: [] as any[],
      duplicatedBusiness: [] as any[], // ✅ Ejemplos de duplicados (mismo slug + misma dirección)
      invalidCategory: [] as any[], // ✅ Ejemplos de negocios sin categorías válidas
    },
  };

  // Contador para debugging
  const jsonCounter = new JSONCounter();

  const processor = new Transform({
    objectMode: true,
    async transform(chunk: any, encoding, callback) {
      try {
        const business = chunk.value;
        await memoryManager.checkAndCleanup();

        // Validar estructura del objeto
        if (!validateBusiness(business)) {
          skipReasons.invalidStructure++;
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.invalidStructure.length < 10) {
            skipReasons.examples.invalidStructure.push({
              record: business,
              reason: 'Estructura inválida o nombre vacío',
            });
          }
          skippedCount++;
          callback();
          return;
        }

        const provinceRaw = business.detailed_address?.state
          ?.trim()
          .toLowerCase();
        const businessCountryCode =
          business.detailed_address?.country_code?.trim();

        // Determinar si estamos procesando CABA para usar ward en lugar de city
        const isCABA = cabaProvinces.includes(provinceRaw || '');
        const cityRaw = isCABA
          ? business.detailed_address?.ward?.trim()
          : business.detailed_address?.city?.trim();

        // Validar país
        if (businessCountryCode !== countryCode) {
          skipReasons.wrongCountry++;
          skipReasons.wrongCountries.add(businessCountryCode || 'undefined');
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.wrongCountry.length < 10) {
            skipReasons.examples.wrongCountry.push({
              record: {
                name: business.name,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `País incorrecto: esperado '${countryCode}', encontrado '${businessCountryCode}'`,
            });
          }
          skippedCount++;
          callback();
          return;
        }

        if (!cityRaw || !provinceRaw) {
          skipReasons.missingLocation++;
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.missingLocation.length < 10) {
            const locationField = isCABA ? 'ward' : 'city';
            skipReasons.examples.missingLocation.push({
              record: {
                name: business.name,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `Falta ubicación: ${locationField}='${cityRaw}', provincia='${provinceRaw}'`,
            });
          }
          skippedCount++;
          // Log específico para datos faltantes
          if (totalProcessed % 1000 === 0) {
            const locationField = isCABA ? 'ward' : 'city';
            console.log(
              `❗ Registro omitido - Falta ubicación: ${locationField}='${cityRaw}', provincia='${provinceRaw}' (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        // ✅ Validar que el negocio tenga al menos una categoría válida
        const allowedCategories = categoryWhitelists[categorySlug];
        if (allowedCategories && !hasValidCategory(business.categories, allowedCategories)) {
          skipReasons.invalidCategory++;
          
          // Track categorías inválidas encontradas
          if (business.categories && Array.isArray(business.categories)) {
            business.categories.forEach(cat => skipReasons.invalidCategories.add(cat.trim()));
          }
          
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.invalidCategory.length < 10) {
            skipReasons.examples.invalidCategory.push({
              record: {
                name: business.name,
                categories: business.categories,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `Negocio sin categorías válidas para '${categorySlug}'. Categorías encontradas: ${JSON.stringify(business.categories)}`,
            });
          }
          
          skippedCount++;
          // Log específico para categorías inválidas
          if (totalProcessed % 1000 === 0) {
            console.log(
              `❗ Registro omitido - Sin categorías válidas: '${business.name}' con categorías ${JSON.stringify(business.categories)} (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        // Validar calidad de datos de la ciudad
        if (!validateCityName(cityRaw, isCABA)) {
          const cityLength = cityRaw?.length || 0;
          const hasNumbers = /\d/.test(cityRaw || '');

          if (cityLength <= 3) {
            skipReasons.invalidCityLength++;
            skipReasons.invalidCities.add(cityRaw || 'undefined');
            // Guardar ejemplo (máximo 10)
            if (skipReasons.examples.invalidCityLength.length < 10) {
              skipReasons.examples.invalidCityLength.push({
                record: {
                  name: business.name,
                  detailed_address: business.detailed_address,
                  address: business.address,
                },
                reason: `Ciudad con longitud inválida (${cityLength} caracteres): '${cityRaw}'`,
              });
            }
          } else if (hasNumbers) {
            skipReasons.invalidCityNumbers++;
            skipReasons.invalidCities.add(cityRaw || 'undefined');
            // Guardar ejemplo (máximo 10)
            if (skipReasons.examples.invalidCityNumbers.length < 10) {
              skipReasons.examples.invalidCityNumbers.push({
                record: {
                  name: business.name,
                  detailed_address: business.detailed_address,
                  address: business.address,
                },
                reason: `Ciudad contiene números, no es código CPA válido, no es barrio de CABA válido, y no está en whitelist: '${cityRaw}'`,
              });
            }
          }

          skippedCount++;
          // Log específico para ciudades inválidas
          if (totalProcessed % 1000 === 0) {
            console.log(
              `❗ Registro omitido - Ciudad inválida: '${cityRaw}' (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        // Log para ciudades aceptadas por whitelist o CPA
        if (/\d/.test(cityRaw || '')) {
          // Verificar CPA code primero
          const cpaCity = findCPACode(cityRaw);
          if (cpaCity) {
            skipReasons.acceptedByCPA++;
            skipReasons.cpaCities.add(cityRaw);
            console.log(`✅ Código CPA resuelto: '${cityRaw}' → '${cpaCity}'`);
          } else if (!isCABA) {
            // Solo verificar whitelist si no es CPA y no es CABA
            const lowerCityName = cityRaw.toLowerCase();
            const isInWhitelist = cityNumberWhitelist.some(
              (city) => city.toLowerCase() === lowerCityName
            );
            if (isInWhitelist) {
              skipReasons.acceptedByWhitelist++;
              skipReasons.whitelistCities.add(cityRaw);
              console.log(
                `✅ Ciudad con números aceptada por whitelist: '${cityRaw}'`
              );
            }
          }
        }

        const normalizedProvince = provinceLookup[countryCode]?.[provinceRaw];
        if (!normalizedProvince) {
          skipReasons.unknownProvince++;
          skipReasons.unknownProvinces.add(provinceRaw);
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.unknownProvince.length < 10) {
            skipReasons.examples.unknownProvince.push({
              record: {
                name: business.name,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `Provincia no reconocida: '${provinceRaw}'`,
            });
          }
          skippedCount++;
          // Log específico para provincias no reconocidas
          if (totalProcessed % 1000 === 0) {
            console.log(
              `❗ Registro omitido - Provincia no reconocida: '${provinceRaw}' (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        const provinceId = provinceMap.get(normalizedProvince.slug);
        if (!provinceId) {
          skipReasons.provinceNotInDB++;
          // Guardar ejemplo (máximo 10)
          if (skipReasons.examples.provinceNotInDB.length < 10) {
            skipReasons.examples.provinceNotInDB.push({
              record: {
                name: business.name,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `Provincia no en BD: '${normalizedProvince.slug}'`,
              normalizedProvince: normalizedProvince,
            });
          }
          skippedCount++;
          // Log específico para provincias no en BD
          if (totalProcessed % 1000 === 0) {
            console.log(
              `❗ Registro omitido - Provincia no en BD: '${normalizedProvince.slug}' (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        // Normalizar nombre de ciudad
        let finalCityName = cityRaw;
        let citySlug = slugify(cityRaw);

        // Verificar si es un código CPA válido primero
        const cpaCity = findCPACode(cityRaw);
        if (cpaCity) {
          finalCityName = cpaCity;
          citySlug = slugify(cpaCity);
        }

        // Para CABA, normalizar usando el lookup de barrios (solo si no fue resuelto por CPA)
        if (isCABA && cityRaw && !cpaCity) {
          const normalizedBarrio = findCABABarrio(cityRaw);

          if (normalizedBarrio) {
            finalCityName = normalizedBarrio.name;
            citySlug = normalizedBarrio.slug;
            console.log(
              `✅ Barrio CABA reconocido: '${cityRaw}' → ${normalizedBarrio.name}`
            );
          } else {
            // Barrio de CABA no reconocido
            skipReasons.unknownBarrioCABA++;
            skipReasons.unknownBarriosCABA.add(cityRaw);
            // Guardar ejemplo (máximo 10)
            if (skipReasons.examples.unknownBarrioCABA.length < 10) {
              skipReasons.examples.unknownBarrioCABA.push({
                record: {
                  name: business.name,
                  detailed_address: business.detailed_address,
                  address: business.address,
                },
                reason: `Barrio de CABA no reconocido: '${cityRaw}'`,
              });
            }
            skippedCount++;
            // Log específico para barrios no reconocidos
            if (totalProcessed % 1000 === 0) {
              console.log(
                `❗ Registro omitido - Barrio CABA no reconocido: '${cityRaw}' (registro #${totalProcessed})`
              );
            }
            callback();
            return;
          }
        }

        const cityKey = `${citySlug}|${provinceId}`;

        // Verificar si necesitamos crear la ciudad
        if (!cityMap.has(cityKey) && !uniqueCities.has(cityKey)) {
          uniqueCities.add(cityKey);
          citiesToCreate.push({
            name: finalCityName,
            slug: citySlug,
            provinceId,
          });
        }

        // Generar slug base para el negocio
        const baseSlug = slugify(`${business.name}-${finalCityName}`);
        const businessAddress = business.detailed_address?.street?.trim() || '';

        // Verificar duplicados por slug base + dirección
        let finalSlug = baseSlug;
        let slugNumber = 1;

        if (processedBusinessSlugs.has(baseSlug)) {
          const addressMap = processedBusinessSlugs.get(baseSlug)!;
          
          // Verificar si esta dirección ya fue procesada
          if (addressMap.has(businessAddress)) {
            // Mismo slug y misma dirección = duplicado real
            skipReasons.duplicatedBusiness++;
            skipReasons.duplicatedSlugs.add(baseSlug);
            // Guardar ejemplo (máximo 10)
            if (skipReasons.examples.duplicatedBusiness.length < 10) {
              skipReasons.examples.duplicatedBusiness.push({
                record: {
                  name: business.name,
                  detailed_address: business.detailed_address,
                  address: business.address,
                },
                reason: `Negocio duplicado (mismo slug y dirección): '${baseSlug}' - '${businessAddress}'`,
                slug: baseSlug,
              });
            }
            skippedCount++;
            // Log específico para duplicados
            if (totalProcessed % 1000 === 0) {
              console.log(
                `❗ Registro omitido - Negocio duplicado: '${business.name}' en '${finalCityName}' con dirección '${businessAddress}' (registro #${totalProcessed})`
              );
            }
            callback();
            return;
          } else {
            // Mismo slug pero dirección diferente = agregar número
            const existingNumbers = Array.from(addressMap.values());
            slugNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 2;
            finalSlug = `${baseSlug}-${slugNumber}`;
            
            // Registrar esta nueva dirección
            addressMap.set(businessAddress, slugNumber);
            
            console.log(
              `✅ Negocio con nombre similar agregado: '${business.name}' en '${finalCityName}' - slug: '${finalSlug}' (dirección diferente)`
            );
          }
        } else {
          // Primer negocio con este slug base
          const addressMap = new Map<string, number>();
          addressMap.set(businessAddress, 1);
          processedBusinessSlugs.set(baseSlug, addressMap);
        }

        // ✅ Mapear slug a categorías originales para tracking
        if (business.categories && Array.isArray(business.categories)) {
          slugToCategoriesMap.set(finalSlug, business.categories);
        }

        // Agregar al batch con cityKey temporal y categoryId
        businessBatch.push({
          name: business.name,
          address: business?.address ?? null,
          phone: business.phone ?? null,
          website: business.website ?? null,
          cityKey, // Usar key temporal
          categoryId, // Agregar categoryId desde parámetro
          latitude: business.coordinates?.latitude ?? null,
          longitude: business.coordinates?.longitude ?? null,
          slug: finalSlug, // ✅ Usar slug ya calculado (con número si es necesario)
          description: business?.description ?? null,
          email: business?.email ?? null,
          image: business?.image ?? null,
          postalCode: business?.postal_code ?? null,
          openingHours: business?.opening_hours ?? null,
          hours: business.hours ?? null,
          googleMapsLink: business?.link ?? null,
          closedOn: business?.closed_on
            ? Array.isArray(business?.closed_on)
              ? business?.closed_on.join(', ')
              : business?.closed_on
            : null,
          googlePlaceId: business?.place_id ?? null,
          googleMapsRating: business?.rating ?? null,
          status: true,
          categories: business.categories, // ✅ Preservar categorías originales
        });

        totalProcessed++;

        if (progressTracker) {
          progressTracker.update(totalProcessed);
        }

        callback();
      } catch (error) {
        console.error('❌ Error procesando registro:', error);
        skippedCount++;
        callback();
      }
    },
  });

  // Crear pipeline robusto con stream-json
  const readStream = createReadStream(filePath, {
    encoding: 'utf8',
    highWaterMark: CONFIG.CHUNK_SIZE,
  });

  // Pipeline optimizado para archivos JSON grandes
  const jsonStream = streamArray.streamArray();
  //const jsonStream = streamObject.streamObject();
  const valuesStream = streamValues.streamValues();

  // Filtrar solo los valores del array principal
  const valueExtractor = new Transform({
    objectMode: true,
    transform(chunk: any, encoding, callback) {
      if (
        chunk.key === undefined &&
        chunk.value &&
        typeof chunk.value === 'object'
      ) {
        this.push(chunk.value);
      }
      callback();
    },
  });

  console.log('🔄 Iniciando procesamiento del archivo JSON...');

  try {
    await pipeline(readStream, parser(), jsonStream, jsonCounter, processor);
  } catch (error) {
    console.error('❌ Error en el pipeline de procesamiento:', error);
    throw error;
  }

  const totalJsonObjects = jsonCounter.getCount();
  console.log(`📊 Estadísticas del archivo:`);
  console.log(
    `   • Objetos JSON totales: ${totalJsonObjects.toLocaleString()}`
  );
  console.log(`   • Registros procesados: ${totalProcessed.toLocaleString()}`);
  console.log(`   • Registros omitidos: ${skippedCount.toLocaleString()}`);
  console.log(
    `   • Tasa de procesamiento: ${((totalProcessed / totalJsonObjects) * 100).toFixed(1)}%`
  );

  // Crear ciudades necesarias
  if (citiesToCreate.length > 0) {
    await bulkCreateCities(citiesToCreate, cityMap);
  }

  // Mapear cityKeys a cityIds reales
  console.log('🔄 Resolviendo IDs de ciudades...');
  const validBusinesses: ProcessedBusiness[] = [];

  for (const business of businessBatch) {
    const cityId = cityMap.get(business.cityKey);
    if (cityId) {
      validBusinesses.push({
        name: business.name,
        address: business.address,
        phone: business.phone,
        website: business.website,
        cityId, // Ahora sí es el ID real
        categoryId: business.categoryId, // Mantener categoryId
        latitude: business.latitude,
        longitude: business.longitude,
        googleMapsLink: business.googleMapsLink,
        googlePlaceId: business.googlePlaceId,
        status: business.status,
        slug: business.slug,
        description: business.description,
        email: business.email,
        image: business.image,
        postalCode: business.postalCode,
        openingHours: business.openingHours,
        hours: business.hours,
        closedOn: business.closedOn,
        googleMapsRating: business.googleMapsRating,
      });
    } else {
      console.warn(`❗ No se encontró cityId para key: ${business.cityKey}`);
    }
  }

  // Procesar negocios en batches
  console.log(
    `🏢 Procesando ${validBusinesses.length.toLocaleString()} negocios...`
  );
  progressTracker = new ProgressTracker(validBusinesses.length);

  const businessChunks = [];
  for (let i = 0; i < validBusinesses.length; i += CONFIG.BATCH_SIZE) {
    businessChunks.push(validBusinesses.slice(i, i + CONFIG.BATCH_SIZE));
  }

  // Contadores para batch results
  let totalSent = 0;
  let totalCreated = 0;
  let totalSkippedByDB = 0;

      for (const [index, chunk] of businessChunks.entries()) {
      batchNumber++;
      const result = await bulkCreateBusinesses(chunk, batchNumber, slugToCategoriesMap, categoryTracker);

    totalSent += result.sent;
    totalCreated += result.created;
    totalSkippedByDB += result.skipped;

    progressTracker.update((index + 1) * CONFIG.BATCH_SIZE);
  }

  progressTracker.finish();

  // Actualizar skipReasons con la información de la BD
  skipReasons.skippedByDatabase = totalSkippedByDB;

  console.log(`✅ Procesamiento completado:`);
  console.log(`   • Negocios enviados a BD: ${totalSent.toLocaleString()}`);
  console.log(
    `   • Negocios realmente creados: ${totalCreated.toLocaleString()}`
  );
  console.log(
    `   • Negocios omitidos por BD (ya existían): ${totalSkippedByDB.toLocaleString()}`
  );
  console.log(
    `   • Ciudades creadas: ${citiesToCreate.length.toLocaleString()}`
  );
  console.log(
    `   • Registros omitidos por validación: ${skippedCount.toLocaleString()}`
  );
  console.log(
    `   • Ciudades aceptadas por whitelist: ${skipReasons.acceptedByWhitelist.toLocaleString()}`
  );
  console.log(
    `   • Ciudades resueltas por CPA codes: ${skipReasons.acceptedByCPA.toLocaleString()}`
  );

  // Mostrar desglose detallado de omisiones
  console.log(`\n📊 Desglose de registros omitidos:`);
  console.log(
    `   • Estructura inválida: ${skipReasons.invalidStructure.toLocaleString()}`
  );
  console.log(
    `   • Falta ubicación: ${skipReasons.missingLocation.toLocaleString()}`
  );
  console.log(
    `   • Sin categorías válidas: ${skipReasons.invalidCategory.toLocaleString()}`
  );
  console.log(
    `   • Ciudad muy corta (≤3 chars): ${skipReasons.invalidCityLength.toLocaleString()}`
  );
  console.log(
    `   • Ciudad con números: ${skipReasons.invalidCityNumbers.toLocaleString()}`
  );
  console.log(
    `   • Provincia no reconocida: ${skipReasons.unknownProvince.toLocaleString()}`
  );
  console.log(
    `   • Provincia no en BD: ${skipReasons.provinceNotInDB.toLocaleString()}`
  );
  console.log(
    `   • País incorrecto: ${skipReasons.wrongCountry.toLocaleString()}`
  );
  console.log(
    `   • Barrio CABA no reconocido: ${skipReasons.unknownBarrioCABA.toLocaleString()}`
  );
  console.log(
    `   • Negocios duplicados (mismo slug + dirección): ${skipReasons.duplicatedBusiness.toLocaleString()}`
  );
  console.log(
    `   • Negocios omitidos por BD (ya existían): ${skipReasons.skippedByDatabase.toLocaleString()}`
  );

  // ✅ Crear directorio organizado para esta ejecución
  const { logDir, timestamp } = createLogDirectory(categorySlug);

  // Exportar detalles a JSON
  await exportSkipReasons(
    skipReasons,
    categorySlug,
    totalCreated,
    totalSkippedByDB,
    totalSent,
    logDir,
    timestamp
  );

  // ✅ Exportar estadísticas de categorías
  await exportCategoryStats(
    categoryTracker,
    categorySlug,
    totalCreated,
    logDir,
    timestamp
  );

  if (skipReasons.unknownProvinces.size > 0) {
    console.log(`\n❗ Provincias no reconocidas (primeras 10):`);
    Array.from(skipReasons.unknownProvinces)
      .slice(0, 10)
      .forEach((prov, i) => {
        console.log(`   ${i + 1}. "${prov}"`);
      });
    if (skipReasons.unknownProvinces.size > 10) {
      console.log(
        `   ... y ${skipReasons.unknownProvinces.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.wrongCountries.size > 0) {
    console.log(`\n❗ Países encontrados (diferentes a ${countryCode}):`);
    Array.from(skipReasons.wrongCountries)
      .slice(0, 10)
      .forEach((country, i) => {
        console.log(`   ${i + 1}. "${country}"`);
      });
    if (skipReasons.wrongCountries.size > 10) {
      console.log(
        `   ... y ${skipReasons.wrongCountries.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.invalidCities.size > 0) {
    console.log(`\n❗ Ciudades inválidas encontradas (primeras 10):`);
    Array.from(skipReasons.invalidCities)
      .slice(0, 10)
      .forEach((city, i) => {
        console.log(`   ${i + 1}. "${city}"`);
      });
    if (skipReasons.invalidCities.size > 10) {
      console.log(
        `   ... y ${skipReasons.invalidCities.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.unknownBarriosCABA.size > 0) {
    console.log(`\n❗ Barrios de CABA no reconocidos (primeros 10):`);
    Array.from(skipReasons.unknownBarriosCABA)
      .slice(0, 10)
      .forEach((barrio, i) => {
        console.log(`   ${i + 1}. "${barrio}"`);
      });
    if (skipReasons.unknownBarriosCABA.size > 10) {
      console.log(
        `   ... y ${skipReasons.unknownBarriosCABA.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.duplicatedSlugs.size > 0) {
    console.log(`\n🔄 Negocios con slugs base duplicados (misma dirección - primeros 10):`);
    Array.from(skipReasons.duplicatedSlugs)
      .slice(0, 10)
      .forEach((slug, i) => {
        console.log(`   ${i + 1}. "${slug}"`);
      });
    if (skipReasons.duplicatedSlugs.size > 10) {
      console.log(
        `   ... y ${skipReasons.duplicatedSlugs.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.whitelistCities.size > 0) {
    console.log(`\n✅ Ciudades aceptadas por whitelist (primeras 10):`);
    Array.from(skipReasons.whitelistCities)
      .slice(0, 10)
      .forEach((city, i) => {
        console.log(`   ${i + 1}. "${city}"`);
      });
    if (skipReasons.whitelistCities.size > 10) {
      console.log(
        `   ... y ${skipReasons.whitelistCities.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.cpaCities.size > 0) {
    console.log(`\n🏷️  Códigos CPA resueltos (primeros 10):`);
    Array.from(skipReasons.cpaCities)
      .slice(0, 10)
      .forEach((code, i) => {
        const resolvedCity = findCPACode(code);
        console.log(`   ${i + 1}. "${code}" → "${resolvedCity}"`);
      });
    if (skipReasons.cpaCities.size > 10) {
      console.log(
        `   ... y ${skipReasons.cpaCities.size - 10} más (ver archivo logs/)`
      );
    }
  }

  if (skipReasons.invalidCategories.size > 0) {
    console.log(`\n❌ Categorías inválidas encontradas (primeras 10):`);
    Array.from(skipReasons.invalidCategories)
      .slice(0, 10)
      .forEach((category, i) => {
        console.log(`   ${i + 1}. "${category}"`);
      });
    if (skipReasons.invalidCategories.size > 10) {
      console.log(
        `   ... y ${skipReasons.invalidCategories.size - 10} más (ver archivo logs/)`
      );
    }
  }
}

// ✅ Helper para crear directorio de logs organizado
function createLogDirectory(categorySlug: string): { logDir: string; timestamp: string } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logDir = path.join(__dirname, 'logs', categorySlug, timestamp);
  
  return { logDir, timestamp };
}

async function updateMissingLocations() {
  try {
    const [{ count }] = await prisma.$queryRawUnsafe<{ count: bigint }[]>(`
      WITH updated AS (
        UPDATE "Business"
        SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND location IS NULL
        RETURNING 1
      )
      SELECT COUNT(*)::bigint AS count FROM updated;
    `);

    console.log(`✅ Location actualizado para ${count.toString()} negocios.`);
    return Number(count);
  } catch (error) {
    console.error('❌ Error actualizando location:', error);
    throw error;
  }
}

async function exportSkipReasons(
  skipReasons: any,
  categorySlug: string,
  totalCreated: number,
  totalSkippedByDB: number,
  totalSent: number,
  logDir?: string,
  timestamp?: string
): Promise<void> {
  // Usar directorio organizado si se proporciona, sino crear uno nuevo
  let finalLogDir: string;
  let finalTimestamp: string;
  
  if (logDir && timestamp) {
    finalLogDir = logDir;
    finalTimestamp = timestamp;
  } else {
    const logInfo = createLogDirectory(categorySlug);
    finalLogDir = logInfo.logDir;
    finalTimestamp = logInfo.timestamp;
  }

  try {
    console.log('🔄 Iniciando exportación de detalles...');

    console.log(`📂 Creando directorio organizado: logs/${categorySlug}/${finalTimestamp}/`);
    await fs.mkdir(finalLogDir, { recursive: true });

    console.log('✅ Directorio creado');

    // Preparar datos para export
    const exportData = {
      timestamp: new Date().toISOString(),
      category: categorySlug,
      summary: {
        totalSent: totalSent,
        totalCreated: totalCreated,
        totalSkippedByDB: totalSkippedByDB,
        invalidStructure: skipReasons.invalidStructure,
        missingLocation: skipReasons.missingLocation,
        invalidCategory: skipReasons.invalidCategory,
        invalidCityLength: skipReasons.invalidCityLength,
        invalidCityNumbers: skipReasons.invalidCityNumbers,
        unknownProvince: skipReasons.unknownProvince,
        provinceNotInDB: skipReasons.provinceNotInDB,
        wrongCountry: skipReasons.wrongCountry,
        duplicatedBusiness: skipReasons.duplicatedBusiness,
        skippedByDatabase: skipReasons.skippedByDatabase,
        acceptedByWhitelist: skipReasons.acceptedByWhitelist,
        acceptedByCPA: skipReasons.acceptedByCPA,
        totalSkippedByValidation:
          skipReasons.invalidStructure +
          skipReasons.missingLocation +
          skipReasons.invalidCategory +
          skipReasons.invalidCityLength +
          skipReasons.invalidCityNumbers +
          skipReasons.unknownProvince +
          skipReasons.provinceNotInDB +
          skipReasons.wrongCountry +
          skipReasons.unknownBarrioCABA +
          skipReasons.duplicatedBusiness,
        totalProcessed:
          totalCreated +
          totalSkippedByDB +
          skipReasons.invalidStructure +
          skipReasons.missingLocation +
          skipReasons.invalidCategory +
          skipReasons.invalidCityLength +
          skipReasons.invalidCityNumbers +
          skipReasons.unknownProvince +
          skipReasons.provinceNotInDB +
          skipReasons.wrongCountry +
          skipReasons.unknownBarrioCABA +
          skipReasons.duplicatedBusiness,
      },
      unknownProvinces: {
        count: skipReasons.unknownProvinces.size,
        businessesSkipped: skipReasons.unknownProvince,
        list: Array.from(skipReasons.unknownProvinces).sort(),
      },
      wrongCountries: {
        count: skipReasons.wrongCountries.size,
        businessesSkipped: skipReasons.wrongCountry,
        list: Array.from(skipReasons.wrongCountries).sort(),
      },
      invalidCities: {
        count: skipReasons.invalidCities.size,
        businessesSkipped:
          skipReasons.invalidCityLength + skipReasons.invalidCityNumbers,
        list: Array.from(skipReasons.invalidCities).sort(),
      },
      unknownBarriosCABA: {
        count: skipReasons.unknownBarriosCABA.size,
        businessesSkipped: skipReasons.unknownBarrioCABA,
        list: Array.from(skipReasons.unknownBarriosCABA).sort(),
      },
      duplicatedSlugs: {
        count: skipReasons.duplicatedSlugs.size,
        businessesSkipped: skipReasons.duplicatedBusiness,
        list: Array.from(skipReasons.duplicatedSlugs).sort(),
      },
      whitelistCities: {
        count: skipReasons.whitelistCities.size,
        businessesSkipped: skipReasons.acceptedByWhitelist,
        list: Array.from(skipReasons.whitelistCities).sort(),
      },
      cpaCities: {
        count: skipReasons.cpaCities.size,
        businessesSkipped: skipReasons.acceptedByCPA,
        list: Array.from(skipReasons.cpaCities).sort(),
      },
      invalidCategories: {
        count: skipReasons.invalidCategories.size,
        businessesSkipped: skipReasons.invalidCategory,
        list: Array.from(skipReasons.invalidCategories).sort(),
      },
      examples: skipReasons.examples,
    };

    // Nombre del archivo con timestamp
    const filename = `skip-reasons-${categorySlug}-${finalTimestamp}.json`;
    const filepath = path.join(finalLogDir, filename);

    console.log(`📝 Escribiendo archivo: ${filepath}`);

    // Escribir archivo
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log(`✅ Archivo creado exitosamente`);
    console.log(`📁 Detalles de omisiones exportados a: ${filepath}`);
    console.log(`📂 Directorio de logs: logs/${categorySlug}/${finalTimestamp}/`);
    console.log(
      `📊 Total de provincias no reconocidas: ${skipReasons.unknownProvinces.size}`
    );
  } catch (error) {
    console.error('❌ Error exportando detalles:', error);
    console.error('Stack trace:', error);

    // Intentar crear en directorio actual como fallback
    try {
      console.log('🔄 Intentando crear en directorio actual...');
      const fallbackFilename = `skip-reasons-${categorySlug}-${finalTimestamp}.json`;
      const fallbackPath = path.join(process.cwd(), fallbackFilename);

      const exportData = {
        timestamp: new Date().toISOString(),
        category: categorySlug,
        summary: {
          totalSent: totalSent,
          totalCreated: totalCreated,
          totalSkippedByDB: totalSkippedByDB,
          invalidStructure: skipReasons.invalidStructure,
          missingLocation: skipReasons.missingLocation,
          invalidCategory: skipReasons.invalidCategory,
          invalidCityLength: skipReasons.invalidCityLength,
          invalidCityNumbers: skipReasons.invalidCityNumbers,
          unknownProvince: skipReasons.unknownProvince,
          provinceNotInDB: skipReasons.provinceNotInDB,
          wrongCountry: skipReasons.wrongCountry,
          duplicatedBusiness: skipReasons.duplicatedBusiness,
          skippedByDatabase: skipReasons.skippedByDatabase,
          acceptedByWhitelist: skipReasons.acceptedByWhitelist,
          acceptedByCPA: skipReasons.acceptedByCPA,
          totalSkippedByValidation:
            skipReasons.invalidStructure +
            skipReasons.missingLocation +
            skipReasons.invalidCategory +
            skipReasons.invalidCityLength +
            skipReasons.invalidCityNumbers +
            skipReasons.unknownProvince +
            skipReasons.provinceNotInDB +
            skipReasons.wrongCountry +
            skipReasons.unknownBarrioCABA +
            skipReasons.duplicatedBusiness,
          totalProcessed:
            totalCreated +
            totalSkippedByDB +
            skipReasons.invalidStructure +
            skipReasons.missingLocation +
            skipReasons.invalidCategory +
            skipReasons.invalidCityLength +
            skipReasons.invalidCityNumbers +
            skipReasons.unknownProvince +
            skipReasons.provinceNotInDB +
            skipReasons.wrongCountry +
            skipReasons.unknownBarrioCABA +
            skipReasons.duplicatedBusiness,
        },
        unknownProvinces: {
          count: skipReasons.unknownProvinces.size,
          businessesSkipped: skipReasons.unknownProvince,
          list: Array.from(skipReasons.unknownProvinces).sort(),
        },
        wrongCountries: {
          count: skipReasons.wrongCountries.size,
          businessesSkipped: skipReasons.wrongCountry,
          list: Array.from(skipReasons.wrongCountries).sort(),
        },
        invalidCities: {
          count: skipReasons.invalidCities.size,
          businessesSkipped:
            skipReasons.invalidCityLength + skipReasons.invalidCityNumbers,
          list: Array.from(skipReasons.invalidCities).sort(),
        },
        unknownBarriosCABA: {
          count: skipReasons.unknownBarriosCABA.size,
          businessesSkipped: skipReasons.unknownBarrioCABA,
          list: Array.from(skipReasons.unknownBarriosCABA).sort(),
        },
        duplicatedSlugs: {
          count: skipReasons.duplicatedSlugs.size,
          businessesSkipped: skipReasons.duplicatedBusiness,
          list: Array.from(skipReasons.duplicatedSlugs).sort(),
        },
        whitelistCities: {
          count: skipReasons.whitelistCities.size,
          businessesSkipped: skipReasons.acceptedByWhitelist,
          list: Array.from(skipReasons.whitelistCities).sort(),
        },
        cpaCities: {
          count: skipReasons.cpaCities.size,
          businessesSkipped: skipReasons.acceptedByCPA,
          list: Array.from(skipReasons.cpaCities).sort(),
        },
        invalidCategories: {
          count: skipReasons.invalidCategories.size,
          businessesSkipped: skipReasons.invalidCategory,
          list: Array.from(skipReasons.invalidCategories).sort(),
        },
        examples: skipReasons.examples,
      };

      await fs.writeFile(
        fallbackPath,
        JSON.stringify(exportData, null, 2),
        'utf8'
      );
      console.log(`✅ Archivo fallback creado en: ${fallbackPath}`);
    } catch (fallbackError) {
      console.error('❌ Error también en fallback:', fallbackError);
    }
  }
}

async function exportCategoryStats(
  categoryTracker: Map<string, number>,
  categorySlug: string,
  totalCreated: number,
  logDir?: string,
  timestamp?: string
): Promise<void> {
  // Usar directorio organizado si se proporciona, sino crear uno nuevo
  let finalLogDir: string;
  let finalTimestamp: string;
  
  if (logDir && timestamp) {
    finalLogDir = logDir;
    finalTimestamp = timestamp;
  } else {
    const logInfo = createLogDirectory(categorySlug);
    finalLogDir = logInfo.logDir;
    finalTimestamp = logInfo.timestamp;
  }

  try {
    console.log('🔄 Iniciando exportación de estadísticas de categorías...');

    console.log(`📂 Creando directorio organizado: logs/${categorySlug}/${finalTimestamp}/`);
    await fs.mkdir(finalLogDir, { recursive: true });

    console.log('✅ Directorio creado');

    // Preparar datos para export - convertir Map a array ordenado por count descendente
    const categoryStats = Array.from(categoryTracker.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const exportData = {
      timestamp: new Date().toISOString(),
      category: categorySlug,
      summary: {
        totalBusinessesCreated: totalCreated,
        uniqueCategories: categoryStats.length,
        totalCategoryOccurrences: Array.from(categoryTracker.values()).reduce((sum, count) => sum + count, 0),
      },
      categories: categoryStats,
    };

    // Nombre del archivo con timestamp
    const filename = `category-stats-${categorySlug}-${finalTimestamp}.json`;
    const filepath = path.join(finalLogDir, filename);

    console.log(`📝 Escribiendo archivo: ${filepath}`);

    // Escribir archivo
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log(`✅ Archivo creado exitosamente`);
    console.log(`📁 Estadísticas de categorías exportadas a: ${filepath}`);
    console.log(`📂 Directorio de logs: logs/${categorySlug}/${finalTimestamp}/`);
    console.log(
      `📊 Total de categorías únicas encontradas: ${categoryStats.length}`
    );
    console.log(
      `📊 Total de ocurrencias de categorías: ${exportData.summary.totalCategoryOccurrences}`
    );

    // Mostrar top 10 categorías
    if (categoryStats.length > 0) {
      console.log(`\n🏆 Top 10 categorías más frecuentes:`);
      categoryStats.slice(0, 10).forEach((cat, i) => {
        console.log(`   ${i + 1}. "${cat.name}": ${cat.count} negocios`);
      });
      if (categoryStats.length > 10) {
        console.log(`   ... y ${categoryStats.length - 10} categorías más (ver archivo)`);
      }
    }
  } catch (error) {
    console.error('❌ Error exportando estadísticas de categorías:', error);
    console.error('Stack trace:', error);

    // Intentar crear en directorio actual como fallback
    try {
      console.log('🔄 Intentando crear en directorio actual...');
      const fallbackFilename = `category-stats-${categorySlug}-${finalTimestamp}.json`;
      const fallbackPath = path.join(process.cwd(), fallbackFilename);

      const categoryStats = Array.from(categoryTracker.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      const exportData = {
        timestamp: new Date().toISOString(),
        category: categorySlug,
        summary: {
          totalBusinessesCreated: totalCreated,
          uniqueCategories: categoryStats.length,
          totalCategoryOccurrences: Array.from(categoryTracker.values()).reduce((sum, count) => sum + count, 0),
        },
        categories: categoryStats,
      };

      await fs.writeFile(
        fallbackPath,
        JSON.stringify(exportData, null, 2),
        'utf8'
      );
      console.log(`✅ Archivo fallback creado en: ${fallbackPath}`);
    } catch (fallbackError) {
      console.error('❌ Error también en fallback:', fallbackError);
    }
  }
}

async function main() {
  const startTime = Date.now();

  // Verificar que Node.js esté configurado correctamente
  if (typeof global.gc !== 'function') {
    console.warn(
      '⚠️  Para mejor rendimiento, ejecutá con: node --expose-gc script.js'
    );
  }

  try {
    // Parsear argumentos
    const { filePath, categorySlug, countryCode } = parseArguments();

    console.log(`📂 Archivo: ${filePath}`);
    console.log(`🏷️  Categoría: ${categorySlug}`);
    console.log(`🌍 País: ${countryCode}`);

    // Validar que el código de país esté soportado
    if (!provinceLookup[countryCode]) {
      const supportedCountries = Object.keys(provinceLookup).join(', ');
      throw new Error(
        `❌ Código de país no soportado: '${countryCode}'. ` +
          `Países disponibles: ${supportedCountries}`
      );
    }
    console.log(`✅ País soportado: ${countryCode}`);

    // Verificar que el archivo exista
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`❌ Archivo no encontrado: ${filePath}`);
    }

    // Validar y obtener el ID de la categoría
    const categoryId = await validateCategory(categorySlug);

    console.log('🚀 Iniciando procesamiento masivo...');
    await processStreamingData(filePath, categoryId, categorySlug, countryCode);

    // 🔥 Agregar la actualización de location después del procesamiento
    console.log('📍 Actualizando columna location...');
    const updated = await updateMissingLocations();
    console.log(`✅ Location actualizado para ${updated} negocios.`);

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log(`🎉 Seed completado en ${duration.toFixed(2)} segundos`);
  } catch (error) {
    console.error('❌ Error crítico:', error);
  }
}

// Configurar manejo de memoria
process.on('warning', (warning) => {
  if (warning.name === 'MaxListenersExceededWarning') {
    console.warn('⚠️  Advertencia de memoria:', warning.message);
  }
});

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
