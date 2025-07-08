import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@rubros/ui';
import { Scale, Shield, AlertTriangle, Mail, FileText } from 'lucide-react';
import { ORGANIZATION } from '@/constants/org';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';

  return {
    title: 'Términos y Condiciones - Encontrá Mecánico',
    description: 'Términos y condiciones de uso del directorio de mecánicos Encontrá Mecánico. Información legal sobre el uso del servicio.',
    keywords: ['terminos', 'condiciones', 'legal', 'encontra mecánico', 'directorio'],
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/terminos-y-condiciones`,
    },
  };
};

export default function TermsPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ORGANIZATION.url;

  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-4xl font-bold">Términos y condiciones</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Información legal sobre el uso del directorio <strong>{ORGANIZATION.name}</strong> y
            las responsabilidades de todas las partes involucradas.
          </p>
        </div>

        <div className="space-y-8">
          {/* Naturaleza del Servicio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Naturaleza del servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                <strong>{ORGANIZATION.name}</strong> es un directorio informativo gratuito que recopila
                información pública disponible en internet sobre talleres mecánicos y servicios automotrices
                en Argentina. Nuestro objetivo es brindar un servicio público de información.
              </p>
              <p className="text-muted-foreground">
                En virtud de ser la presente página totalmente gratuita para los mecánicos, y siendo su
                objetivo un servicio público, rogamos a los talleres mecánicos y/o profesionales que no
                deseen formar parte de la presente página, tener a bien comunicar su negativa en forma fehaciente
                a través de nuestros canales oficiales de contacto.
              </p>
            </CardContent>
          </Card>

          {/* Fuentes de Información */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                2. Fuentes de información
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Toda la información publicada en {ORGANIZATION.name} proviene exclusivamente de
                <strong> fuentes públicas disponibles en internet</strong>, incluyendo pero no limitándose a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Directorios comerciales públicos</li>
                <li>Sitios web oficiales de empresas</li>
                <li>Plataformas de mapas y geolocalización</li>
                <li>Redes sociales públicas</li>
                <li>Registros comerciales públicos</li>
              </ul>
              <p className="text-muted-foreground">
                No recopilamos información privada ni confidencial de ningún tipo.
              </p>
            </CardContent>
          </Card>

          {/* Limitación de Responsabilidad */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                3. Limitación de responsabilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-900 mb-2">IMPORTANTE - DESLINDE DE RESPONSABILIDAD:</p>
                <p className="text-orange-800 text-sm leading-relaxed">
                  LOS TALLERES Y SERVICIOS CUYOS TEXTOS, INFORMACIÓN O DATOS SE PUBLIQUEN EN LA PRESENTE
                  PÁGINA WEB O EN LA APLICACIÓN, NO TIENEN NINGUNA VINCULACIÓN LABORAL, COMERCIAL O
                  PROFESIONAL CON {baseUrl.replace(/^https?:\/\//, '').toUpperCase()} NI CON SUS RESPONSABLES.
                </p>
              </div>

              <p className="text-muted-foreground">
                Al utilizar los servicios de {ORGANIZATION.name}, el usuario acepta expresamente que:
              </p>

              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>
                  <strong>{ORGANIZATION.name}</strong> actúa únicamente como un directorio informativo
                </li>
                <li>
                  No verificamos, avalamos ni garantizamos la calidad de los servicios listados
                </li>
                <li>
                  No somos responsables de la exactitud, actualización o veracidad de la información
                </li>
                <li>
                  No intermediamos en la contratación de servicios entre usuarios y talleres
                </li>
                <li>
                  Los usuarios son responsables de verificar la información directamente con cada taller
                </li>
              </ul>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm font-medium">
                  AL ACEPTAR LOS PRESENTES TÉRMINOS Y CONDICIONES, EL USUARIO LIBERA A LOS RESPONSABLES
                  DE {ORGANIZATION.name} DE TODA RESPONSABILIDAD EMERGENTE DE CARÁCTER LEGAL, ECONÓMICO,
                  COMERCIAL O DE CUALQUIER OTRO TIPO QUE PUDIERA DERIVARSE DEL USO DE LA INFORMACIÓN
                  CONTENIDA EN ESTE DIRECTORIO.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Derechos de los Talleres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. Derechos de los talleres listados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Los propietarios de talleres mecánicos tienen derecho a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Solicitar la remoción de su información del directorio</li>
                <li>Solicitar la corrección de información incorrecta</li>
                <li>Comunicar cualquier objeción al uso de su información pública</li>
              </ul>
              <p className="text-muted-foreground">
                Para ejercer estos derechos, debe contactarnos a través de nuestros canales oficiales
                proporcionando identificación válida y prueba de titularidad del negocio.
              </p>
            </CardContent>
          </Card>

          {/* Uso Responsable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                5. Uso responsable del servicio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Los usuarios del directorio se comprometen a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Usar la información únicamente para fines informativos legítimos</li>
                <li>No utilizar los datos para spam, acoso o actividades comerciales no autorizadas</li>
                <li>Verificar la información directamente con los talleres antes de contratar servicios</li>
                <li>Respetar los derechos de propiedad intelectual y comercial de terceros</li>
              </ul>
            </CardContent>
          </Card>

          {/* Modificaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                6. Modificaciones a los términos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento.
                Las modificaciones entrarán en vigencia inmediatamente después de su publicación en el sitio web.
                Es responsabilidad del usuario revisar periódicamente estos términos.
              </p>
            </CardContent>
          </Card>

          {/* Jurisdicción */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                7. Jurisdicción y ley aplicable
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Estos términos y condiciones se rigen por las leyes de la República Argentina.
                Cualquier controversia será sometida a la jurisdicción de los tribunales competentes
                de la Ciudad Autónoma de Buenos Aires.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                8. Contacto legal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Para consultas legales, solicitudes de remoción o cualquier comunicación relacionada
                con estos términos y condiciones:
              </p>
              <div className="bg-card p-4 rounded-lg border">
                <p className="font-medium mb-2">Email legal:</p>
                <a href="mailto:legal@encontramecanico.com" className="text-primary hover:underline">
                  legal@encontramecanico.com
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Footer de términos */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>
              <strong>Última actualización:</strong> {new Date().toLocaleDateString('es-AR')}
            </p>
            <p className="mt-2">
              {ORGANIZATION.name} - Directorio de información pública
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}