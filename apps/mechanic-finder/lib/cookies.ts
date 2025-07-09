// Tipos de cookies
export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
};

// Valores por defecto
export const DEFAULT_CONSENT: CookieConsent = {
  necessary: true, // Siempre necesarias
  analytics: false,
  advertising: false,
  timestamp: Date.now(),
};

// Clave para localStorage
const CONSENT_KEY = 'cookie-consent';

// Obtener consentimiento guardado
export function getSavedConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved) as CookieConsent;

    // Verificar si el consentimiento es muy antiguo (más de 1 año)
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > oneYear) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

// Guardar consentimiento
export function saveConsent(consent: Omit<CookieConsent, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  const consentWithTimestamp: CookieConsent = {
    ...consent,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentWithTimestamp));

    // Disparar evento personalizado para que otros componentes puedan reaccionar
    window.dispatchEvent(
      new CustomEvent('cookieConsentChanged', {
        detail: consentWithTimestamp,
      })
    );
  } catch (error) {
    console.error('Error saving cookie consent:', error);
  }
}

// Verificar si necesitamos mostrar el banner
export function shouldShowBanner(): boolean {
  return getSavedConsent() === null;
}

// Obtener consentimiento actual o por defecto
export function getCurrentConsent(): CookieConsent {
  return getSavedConsent() || DEFAULT_CONSENT;
}

// Funciones de utilidad para verificar permisos específicos
export function canUseAnalytics(): boolean {
  const consent = getCurrentConsent();
  return consent.analytics;
}

export function canUseAdvertising(): boolean {
  const consent = getCurrentConsent();
  return consent.advertising;
}

// Limpiar consentimiento (para testing o reset)
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONSENT_KEY);
}
