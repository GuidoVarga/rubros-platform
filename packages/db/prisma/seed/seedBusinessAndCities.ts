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

interface BusinessData {
  name: string;
  description: string;
  email: string;
  image: string;
  category: string;
  detailed_address?: {
    city?: string;
    state?: string;
    country_code?: string;
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

// Validación de calidad de datos para ciudades
function validateCityName(cityName: string): boolean {
  if (!cityName || typeof cityName !== 'string') {
    return false;
  }

  const trimmedName = cityName.trim();

  // Debe tener más de 3 letras
  if (trimmedName.length <= 3) {
    return false;
  }

  // No debe contener números
  if (/\d/.test(trimmedName)) {
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
        //@ts-expect-error gc is defined
        global.gc();
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
  batchNumber: number
): Promise<void> {
  if (businesses.length === 0) return;

  try {
    await executeWithTransaction(async () => {
      await prisma.business.createMany({
        //@ts-expect-error TODO: fix this
        data: businesses,
        skipDuplicates: true,
      });
    });
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
    unknownProvinces: new Set<string>(),
    wrongCountries: new Set<string>(),
    invalidCities: new Set<string>(),
    examples: {
      invalidStructure: [] as any[],
      missingLocation: [] as any[],
      invalidCityLength: [] as any[],
      invalidCityNumbers: [] as any[],
      unknownProvince: [] as any[],
      provinceNotInDB: [] as any[],
      wrongCountry: [] as any[],
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

        const cityRaw = business.detailed_address?.city?.trim();
        const provinceRaw = business.detailed_address?.state
          ?.trim()
          .toLowerCase();
        const businessCountryCode =
          business.detailed_address?.country_code?.trim();

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
            skipReasons.examples.missingLocation.push({
              record: {
                name: business.name,
                detailed_address: business.detailed_address,
                address: business.address,
              },
              reason: `Falta ubicación: ciudad='${cityRaw}', provincia='${provinceRaw}'`,
            });
          }
          skippedCount++;
          // Log específico para datos faltantes
          if (totalProcessed % 1000 === 0) {
            console.log(
              `❗ Registro omitido - Falta ubicación: ciudad='${cityRaw}', provincia='${provinceRaw}' (registro #${totalProcessed})`
            );
          }
          callback();
          return;
        }

        // Validar calidad de datos de la ciudad
        if (!validateCityName(cityRaw)) {
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
                reason: `Ciudad contiene números: '${cityRaw}'`,
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

        const citySlug = slugify(cityRaw);
        const cityKey = `${citySlug}|${provinceId}`;

        // Verificar si necesitamos crear la ciudad
        if (!cityMap.has(cityKey) && !uniqueCities.has(cityKey)) {
          uniqueCities.add(cityKey);
          citiesToCreate.push({
            name: cityRaw,
            slug: citySlug,
            provinceId,
          });
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
          slug: slugify(`${business.name}-${business.detailed_address?.city}`),
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

  for (const [index, chunk] of businessChunks.entries()) {
    batchNumber++;
    await bulkCreateBusinesses(chunk, batchNumber);
    progressTracker.update((index + 1) * CONFIG.BATCH_SIZE);
  }

  progressTracker.finish();

  console.log(`✅ Procesamiento completado:`);
  console.log(
    `   • Negocios creados: ${validBusinesses.length.toLocaleString()}`
  );
  console.log(
    `   • Ciudades creadas: ${citiesToCreate.length.toLocaleString()}`
  );
  console.log(`   • Registros omitidos: ${skippedCount.toLocaleString()}`);

  // Mostrar desglose detallado de omisiones
  console.log(`\n📊 Desglose de registros omitidos:`);
  console.log(
    `   • Estructura inválida: ${skipReasons.invalidStructure.toLocaleString()}`
  );
  console.log(
    `   • Falta ubicación: ${skipReasons.missingLocation.toLocaleString()}`
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

  // Exportar detalles a JSON
  await exportSkipReasons(skipReasons, categorySlug, validBusinesses.length);

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
  totalSuccess: number
): Promise<void> {
  try {
    console.log('🔄 Iniciando exportación de detalles...');

    // Usar path relativo al archivo actual del script
    const logsDir = path.join(__dirname, 'logs');

    console.log(`📂 Creando directorio: ${logsDir}`);
    await fs.mkdir(logsDir, { recursive: true });

    console.log('✅ Directorio creado');

    // Preparar datos para export
    const exportData = {
      timestamp: new Date().toISOString(),
      category: categorySlug,
      summary: {
        totalSuccess: totalSuccess,
        invalidStructure: skipReasons.invalidStructure,
        missingLocation: skipReasons.missingLocation,
        invalidCityLength: skipReasons.invalidCityLength,
        invalidCityNumbers: skipReasons.invalidCityNumbers,
        unknownProvince: skipReasons.unknownProvince,
        provinceNotInDB: skipReasons.provinceNotInDB,
        wrongCountry: skipReasons.wrongCountry,
        totalSkipped:
          skipReasons.invalidStructure +
          skipReasons.missingLocation +
          skipReasons.invalidCityLength +
          skipReasons.invalidCityNumbers +
          skipReasons.unknownProvince +
          skipReasons.provinceNotInDB +
          skipReasons.wrongCountry,
        totalProcessed:
          totalSuccess +
          skipReasons.invalidStructure +
          skipReasons.missingLocation +
          skipReasons.invalidCityLength +
          skipReasons.invalidCityNumbers +
          skipReasons.unknownProvince +
          skipReasons.provinceNotInDB +
          skipReasons.wrongCountry,
      },
      unknownProvinces: {
        count: skipReasons.unknownProvinces.size,
        list: Array.from(skipReasons.unknownProvinces).sort(),
      },
      wrongCountries: {
        count: skipReasons.wrongCountries.size,
        list: Array.from(skipReasons.wrongCountries).sort(),
      },
      invalidCities: {
        count: skipReasons.invalidCities.size,
        list: Array.from(skipReasons.invalidCities).sort(),
      },
      examples: skipReasons.examples,
    };

    // Nombre del archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `skip-reasons-${categorySlug}-${timestamp}.json`;
    const filepath = path.join(logsDir, filename);

    console.log(`📝 Escribiendo archivo: ${filepath}`);

    // Escribir archivo
    await fs.writeFile(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log(`✅ Archivo creado exitosamente`);
    console.log(`📁 Detalles de omisiones exportados a: ${filepath}`);
    console.log(
      `📊 Total de provincias no reconocidas: ${skipReasons.unknownProvinces.size}`
    );
  } catch (error) {
    console.error('❌ Error exportando detalles:', error);
    console.error('Stack trace:', error);

    // Intentar crear en directorio actual como fallback
    try {
      console.log('🔄 Intentando crear en directorio actual...');
      const fallbackFilename = `skip-reasons-${categorySlug}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const fallbackPath = path.join(process.cwd(), fallbackFilename);

      const exportData = {
        timestamp: new Date().toISOString(),
        category: categorySlug,
        summary: {
          totalSuccess: totalSuccess,
          invalidStructure: skipReasons.invalidStructure,
          missingLocation: skipReasons.missingLocation,
          invalidCityLength: skipReasons.invalidCityLength,
          invalidCityNumbers: skipReasons.invalidCityNumbers,
          unknownProvince: skipReasons.unknownProvince,
          provinceNotInDB: skipReasons.provinceNotInDB,
          wrongCountry: skipReasons.wrongCountry,
          totalSkipped:
            skipReasons.invalidStructure +
            skipReasons.missingLocation +
            skipReasons.invalidCityLength +
            skipReasons.invalidCityNumbers +
            skipReasons.unknownProvince +
            skipReasons.provinceNotInDB +
            skipReasons.wrongCountry,
          totalProcessed:
            totalSuccess +
            skipReasons.invalidStructure +
            skipReasons.missingLocation +
            skipReasons.invalidCityLength +
            skipReasons.invalidCityNumbers +
            skipReasons.unknownProvince +
            skipReasons.provinceNotInDB +
            skipReasons.wrongCountry,
        },
        unknownProvinces: {
          count: skipReasons.unknownProvinces.size,
          list: Array.from(skipReasons.unknownProvinces).sort(),
        },
        wrongCountries: {
          count: skipReasons.wrongCountries.size,
          list: Array.from(skipReasons.wrongCountries).sort(),
        },
        invalidCities: {
          count: skipReasons.invalidCities.size,
          list: Array.from(skipReasons.invalidCities).sort(),
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
