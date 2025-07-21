'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent } from '@rubros/ui';
import { Cookie, Settings, X, Check, AlertCircle } from 'lucide-react';
import { shouldShowBanner, saveConsent, type CookieConsent } from '@/lib/cookies';
import Link from 'next/link';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    setIsVisible(shouldShowBanner());
  }, []);

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      advertising: true,
    });
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      advertising: false,
    });
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setIsVisible(false);
  };

  const handlePreferenceChange = (type: keyof typeof preferences, value: boolean) => {
    if (type === 'necessary') return; // No se puede deshabilitar
    setPreferences(prev => ({ ...prev, [type]: value }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 shadow-lg bg-transparent">
      <div className="container max-w-6xl mx-auto">
        <Card className="border-primary/20 bg-card/95">
          <CardContent className="p-6">
            {!showSettings ? (
              // Vista simple del banner
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">🍪 Uso de cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Utilizamos cookies esenciales para el funcionamiento del sitio y cookies opcionales
                      para análisis y publicidad personalizada. Puedes elegir qué cookies aceptar.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      <span>
                        Lee nuestra{' '}
                        <Link href="/politica-privacidad" className="text-primary hover:underline">
                          Política de Privacidad
                        </Link>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Personalizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectAll}
                  >
                    Rechazar opcionales
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Aceptar todas
                  </Button>
                </div>
              </div>
            ) : (
              // Vista detallada de configuración
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-lg">Configuración de cookies</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-6">
                  {/* Cookies necesarias */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Cookies necesarias</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Siempre activo
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Esenciales para el funcionamiento básico del sitio web. No se pueden deshabilitar.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ejemplos: Sesión, seguridad, preferencias básicas
                      </p>
                    </div>
                    <div className="ml-4">
                      <div className="w-11 h-6 bg-primary rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Cookies de análisis */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-medium">Cookies de análisis</h4>
                      <p className="text-sm text-muted-foreground">
                        Nos ayudan a entender cómo usas el sitio para mejorarlo (Google Analytics).
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Datos anónimos sobre navegación y uso del sitio
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                        className={`w-11 h-6 rounded-full flex items-center transition-colors ${preferences.analytics
                            ? 'bg-primary justify-end'
                            : 'bg-muted-foreground/30 justify-start'
                          } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Cookies de publicidad */}
                  <div className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2 flex-1">
                      <h4 className="font-medium">Cookies de publicidad</h4>
                      <p className="text-sm text-muted-foreground">
                        Permiten mostrar anuncios relevantes y medir su efectividad (Google AdSense).
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Personalización de anuncios basada en intereses
                      </p>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => handlePreferenceChange('advertising', !preferences.advertising)}
                        className={`w-11 h-6 rounded-full flex items-center transition-colors ${preferences.advertising
                            ? 'bg-primary justify-end'
                            : 'bg-muted-foreground/30 justify-start'
                          } px-1`}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleRejectAll}
                    className="sm:flex-1"
                  >
                    Rechazar opcionales
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="sm:flex-1 gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Guardar preferencias
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  Puedes cambiar estas preferencias en cualquier momento desde nuestra{' '}
                  <Link href="/politica-privacidad" className="text-primary hover:underline">
                    política de privacidad
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}