// Coordenadas de fallback para ciudades principales de Argentina
// Estos son centros aproximados de las ciudades más importantes

type CityCoords = {
  lat: number;
  lng: number;
};

export const CITY_COORDINATES: Record<string, CityCoords> = {
  // Buenos Aires
  'caba': { lat: -34.6037, lng: -58.3816 },
  'buenos-aires': { lat: -34.6037, lng: -58.3816 },
  'la-plata': { lat: -34.9205, lng: -57.9536 },
  'mar-del-plata': { lat: -38.0023, lng: -57.5575 },
  'bahia-blanca': { lat: -38.7183, lng: -62.2663 },
  'tandil': { lat: -37.3317, lng: -59.1332 },
  'quilmes': { lat: -34.7197, lng: -58.2638 },
  'lanus': { lat: -34.7068, lng: -58.3960 },
  'avellaneda': { lat: -34.6618, lng: -58.3663 },
  
  // Córdoba
  'cordoba': { lat: -31.4201, lng: -64.1888 },
  'cordoba-capital': { lat: -31.4201, lng: -64.1888 },
  'rio-cuarto': { lat: -33.1301, lng: -64.3496 },
  'villa-maria': { lat: -32.4073, lng: -63.2405 },
  
  // Santa Fe
  'santa-fe': { lat: -31.6333, lng: -60.7 },
  'santa-fe-capital': { lat: -31.6333, lng: -60.7 },
  'rosario': { lat: -32.9442, lng: -60.6505 },
  'rafaela': { lat: -31.2500, lng: -61.4867 },
  
  // Mendoza
  'mendoza': { lat: -32.8895, lng: -68.8458 },
  'mendoza-capital': { lat: -32.8895, lng: -68.8458 },
  'san-rafael': { lat: -34.6177, lng: -68.3301 },
  
  // Tucumán
  'tucuman': { lat: -26.8083, lng: -65.2176 },
  'san-miguel-de-tucuman': { lat: -26.8083, lng: -65.2176 },
  
  // Salta
  'salta': { lat: -24.7821, lng: -65.4232 },
  'salta-capital': { lat: -24.7821, lng: -65.4232 },
  
  // Misiones
  'posadas': { lat: -27.3676, lng: -55.8961 },
  'puerto-iguazu': { lat: -25.5947, lng: -54.5733 },
  
  // Entre Ríos
  'parana': { lat: -31.7319, lng: -60.5297 },
  'concordia': { lat: -31.3927, lng: -58.0209 },
  
  // Chaco
  'resistencia': { lat: -27.4692, lng: -58.9299 },
  
  // Corrientes
  'corrientes': { lat: -27.4692, lng: -58.8306 },
  
  // Jujuy
  'san-salvador-de-jujuy': { lat: -24.1858, lng: -65.2995 },
  'jujuy': { lat: -24.1858, lng: -65.2995 },
  
  // Santiago del Estero
  'santiago-del-estero': { lat: -27.7951, lng: -64.2615 },
  
  // La Rioja
  'la-rioja': { lat: -29.4138, lng: -66.8551 },
  
  // Catamarca
  'catamarca': { lat: -28.4696, lng: -65.7852 },
  
  // San Juan
  'san-juan': { lat: -31.5375, lng: -68.5364 },
  
  // San Luis
  'san-luis': { lat: -33.2957, lng: -66.3378 },
  
  // Neuquén
  'neuquen': { lat: -38.9516, lng: -68.0591 },
  
  // Río Negro
  'bariloche': { lat: -41.1335, lng: -71.3103 },
  'viedma': { lat: -40.8135, lng: -62.9967 },
  
  // Chubut
  'comodoro-rivadavia': { lat: -45.8667, lng: -67.5 },
  'trelew': { lat: -43.2489, lng: -65.3050 },
  
  // Santa Cruz
  'rio-gallegos': { lat: -51.6226, lng: -69.2181 },
  
  // Tierra del Fuego
  'ushuaia': { lat: -54.8019, lng: -68.3030 },
  
  // La Pampa
  'santa-rosa': { lat: -36.6167, lng: -64.2833 },
  
  // Formosa
  'formosa': { lat: -26.1775, lng: -58.1781 },
};

// Coordenadas por defecto (Buenos Aires) para ciudades no mapeadas
export const DEFAULT_COORDINATES: CityCoords = {
  lat: -34.6037,
  lng: -58.3816
};

// Función helper para obtener coordenadas de una ciudad
export function getCityCoordinates(citySlug: string): CityCoords {
  return CITY_COORDINATES[citySlug] || DEFAULT_COORDINATES;
} 