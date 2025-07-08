import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@rubros/ui';
import { Shield, Eye, Cookie, Database, Mail, Lock, Users, AlertCircle } from 'lucide-react';
import { ORGANIZATION } from '@/constants/org';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  return {
    title: 'Política de Privacidad - Encontrá Mecánico',
    description: 'Política de privacidad de Encontrá Mecánico. Información sobre cómo recopilamos, usamos y protegemos tus datos personales.',
    keywords: ['politica privacidad', 'datos personales', 'encontra mecánico', 'proteccion datos'],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/politica-privacidad`,
    },
  };
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Política de privacidad</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            En <strong>{ORGANIZATION.name}</strong> respetamos tu privacidad y nos comprometemos a
            proteger tus datos personales. Esta política explica cómo recopilamos, usamos y protegemos tu información.
          </p>
        </div>

        <div className="space-y-8">
          {/* Información que recopilamos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                1. Información que recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-700">Información que NO recopilamos:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>No solicitamos registro de usuarios</li>
                    <li>No recopilamos nombres, emails o teléfonos de visitantes</li>
                    <li>No almacenamos información personal identificable</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Información técnica automática:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li><strong>Dirección IP:</strong> Para análisis geográfico y seguridad</li>
                    <li><strong>Navegador y dispositivo:</strong> Para optimizar la experiencia</li>
                    <li><strong>Páginas visitadas:</strong> Para mejorar el contenido</li>
                    <li><strong>Tiempo de permanencia:</strong> Para análisis estadístico</li>
                    <li><strong>Referencia de origen:</strong> Para entender cómo llegaste al sitio</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Información de contacto voluntaria:</h4>
                  <p className="text-muted-foreground">
                    Solo si decides contactarnos voluntariamente a través de nuestros formularios
                    o emails, recopilaremos la información que nos proporciones para responder a tu consulta.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookies y tecnologías */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                2. Cookies y tecnologías de seguimiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cookies esenciales</h4>
                  <p className="text-sm text-muted-foreground">
                    Necesarias para el funcionamiento básico del sitio y no se pueden deshabilitar.
                  </p>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Cookies analíticas</h4>
                  <p className="text-sm text-muted-foreground">
                    Google Analytics para entender cómo usas el sitio y mejorarlo (datos anónimos).
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Control de cookies:</strong> Puedes configurar tu navegador para rechazar cookies,
                  aunque esto podría afectar la funcionalidad del sitio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cómo usamos la información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                3. Cómo usamos tu información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                La información técnica que recopilamos automáticamente se utiliza para:
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Mejorar el servicio:</strong> Optimizar el rendimiento y la usabilidad</li>
                <li><strong>Análisis estadístico:</strong> Entender patrones de uso (datos agregados y anónimos)</li>
                <li><strong>Seguridad:</strong> Detectar y prevenir actividades maliciosas</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por la ley</li>
                <li><strong>Soporte técnico:</strong> Resolver problemas técnicos del sitio</li>
              </ul>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>Importante:</strong> NO vendemos, alquilamos ni compartimos tu información
                  personal con terceros para fines comerciales.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compartir información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                4. Compartir información con terceros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Podemos compartir información no personal y agregada con:
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Google Analytics:</strong> Datos anónimos para análisis de uso</li>
                <li><strong>Proveedores de servicios:</strong> Hosting, CDN y servicios técnicos</li>
                <li><strong>Autoridades:</strong> Solo cuando sea legalmente requerido</li>
              </ul>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm">
                  <strong>Nunca compartimos:</strong> Información personal identificable sin tu
                  consentimiento explícito, excepto cuando sea legalmente obligatorio.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos del usuario */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                5. Tus derechos sobre tus datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Como usuario, tienes los siguientes derechos:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Derechos disponibles:</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                    <li>Acceder a tus datos personales</li>
                    <li>Rectificar información incorrecta</li>
                    <li>Solicitar eliminación de datos</li>
                    <li>Limitar el procesamiento</li>
                    <li>Retirar consentimiento</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cómo ejercer tus derechos:</h4>
                  <p className="text-sm text-muted-foreground">
                    Contactanos en <strong>privacidad@encontramecanico.com</strong> con
                    tu solicitud específica y te responderemos en un plazo máximo de 30 días.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                6. Seguridad de la información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información:
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Cifrado SSL/TLS:</strong> Toda la comunicación está encriptada</li>
                <li><strong>Acceso limitado:</strong> Solo personal autorizado puede acceder a los datos</li>
                <li><strong>Monitoreo:</strong> Supervisión continua de la seguridad del sistema</li>
                <li><strong>Actualizaciones:</strong> Mantenemos el software actualizado con parches de seguridad</li>
              </ul>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 text-sm">
                  <strong>Limitación:</strong> Aunque implementamos medidas de seguridad robustas,
                  ningún sistema es 100% seguro. No podemos garantizar seguridad absoluta.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Retención de datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                7. Retención de datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Datos técnicos:</h4>
                  <p className="text-sm text-muted-foreground">
                    Logs del servidor y datos analíticos se conservan por un máximo de
                    <strong> 24 meses</strong> para análisis de tendencias y seguridad.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Datos de contacto:</h4>
                  <p className="text-sm text-muted-foreground">
                    Si nos contactas, conservamos tu información solo el tiempo necesario
                    para responder tu consulta y seguimiento (máximo <strong>12 meses</strong>).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menores de edad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                8. Menores de edad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nuestro servicio está dirigido a personas mayores de 18 años. No recopilamos
                intencionalmente información personal de menores de edad. Si descubrimos que
                hemos recopilado información de un menor, la eliminaremos inmediatamente.
              </p>
            </CardContent>
          </Card>

          {/* Cambios en la política */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                9. Cambios en esta política
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos
                cualquier cambio significativo publicando la nueva política en esta página.
                La fecha de "última actualización" siempre estará visible al final del documento.
              </p>
            </CardContent>
          </Card>

          {/* Contacto para privacidad */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                10. Contacto para asuntos de privacidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para cualquier consulta, solicitud o inquietud relacionada con esta política
                de privacidad o el manejo de tus datos personales:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <p className="font-medium mb-2">Email de privacidad:</p>
                  <a href="mailto:privacidad@encontramecanico.com" className="text-primary hover:underline">
                    privacidad@encontramecanico.com
                  </a>
                </div>

                <div className="bg-card p-4 rounded-lg border">
                  <p className="font-medium mb-2">Tiempo de respuesta:</p>
                  <p className="text-sm text-muted-foreground">
                    Máximo 30 días calendario
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ley aplicable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                11. Ley aplicable y jurisdicción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Esta política de privacidad se rige por las leyes de la República Argentina,
                incluyendo la Ley de Protección de Datos Personales N° 25.326 y sus modificatorias.
                Cualquier controversia será sometida a los tribunales competentes de la
                Ciudad Autónoma de Buenos Aires.
              </p>
            </CardContent>
          </Card>

          {/* Footer de política */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
            </p>
            <p className="mt-2">
              {ORGANIZATION.name} - Comprometidos con tu privacidad
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}