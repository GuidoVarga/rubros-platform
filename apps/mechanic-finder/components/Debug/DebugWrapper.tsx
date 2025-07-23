'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@rubros/ui';

type DebugWrapperProps = {
  children: React.ReactNode;
  title?: string;
  requireKey?: boolean;
};

export function DebugWrapper({
  children,
  title = "Debug Page",
  requireKey = false
}: DebugWrapperProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [debugKey, setDebugKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    // Solo en development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Si no requiere key, autorizar directamente
    if (!requireKey) {
      setIsAuthorized(true);
      return;
    }

    // Verificar si ya está autorizado en sessionStorage
    const sessionAuth = sessionStorage.getItem('debug-authorized');
    if (sessionAuth === 'true') {
      setIsAuthorized(true);
    } else {
      setShowKeyInput(true);
    }
  }, [requireKey]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar key (puedes customizar esta lógica)
    const validKeys = ['debug123', 'dev', 'test'];
    if (validKeys.includes(debugKey.toLowerCase())) {
      setIsAuthorized(true);
      setShowKeyInput(false);
      sessionStorage.setItem('debug-authorized', 'true');
    } else {
      alert('Invalid debug key');
    }
  };

  // En producción, no mostrar nada
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">404 - Page Not Found</h1>
              <p className="text-gray-600 mt-2">This page is not available in production.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar input de key si es requerido
  if (showKeyInput) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">🔐 Debug Access</h2>
              <form onSubmit={handleKeySubmit} className="space-y-4">
                <input
                  type="password"
                  placeholder="Enter debug key"
                  value={debugKey}
                  onChange={(e) => setDebugKey(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                >
                  Access Debug Page
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">
                Development only. Try: debug123, dev, or test
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar contenido si está autorizado
  if (isAuthorized) {
    return (
      <div>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ {title}</strong> - Development mode only. This page is hidden in production.
              </p>
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return null;
}