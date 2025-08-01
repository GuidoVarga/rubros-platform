import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@rubros/ui';
import { Mail, Clock, MessageCircle, HelpCircle } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  return {
    title: 'Contacto - Encontrá Mecánico',
    description: 'Contactate con Encontrá Mecánico. Preguntas, sugerencias o información sobre nuestro directorio de talleres mecánicos.',
    keywords: ['contacto', 'encontra mecánico', 'soporte', 'ayuda', 'talleres mecánicos'],
    alternates: {
      canonical: `${baseUrl}/contacto/`,
    },
  };
}

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contactanos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            ¿Tenés preguntas sobre nuestro directorio? ¿Querés sugerir mejoras?
            Estamos acá para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Email
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Para consultas generales y soporte:</p>
              <a href="mailto:contacto@encontramecanico.com" className="text-primary font-medium hover:underline">
                contacto@encontramecanico.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">Respuesta rápida por mensaje:</p>
              <a href="https://wa.me/5491234567890" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
                +54 9 11 2345-6789
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Preguntas frecuentes</h2>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿De dónde obtienen la información de los talleres?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Recopilamos información pública disponible en internet desde diversas fuentes como
                  directorios comerciales, sitios web oficiales, plataformas de mapas y redes sociales.
                  Toda la información es de carácter público.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿Verifican la calidad de los talleres listados?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Actualmente funcionamos como un directorio informativo. No verificamos ni garantizamos
                  la calidad de los servicios listados. Recomendamos siempre verificar la información
                  directamente con cada taller antes de solicitar servicios.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿Puedo dejar reseñas o comentarios sobre los talleres?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta funcionalidad estará disponible en futuras versiones de la plataforma.
                  Por ahora, nuestro enfoque está en proporcionar información básica de contacto
                  y ubicación de los talleres.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿Cómo puedo contactar directamente con un taller?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Cuando la información de contacto está disponible públicamente, la mostramos en
                  la página del taller. Podés llamar o enviar un mensaje directamente. No intermediamos
                  en la comunicación entre usuarios y talleres.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿El servicio tiene algún costo?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No, el acceso a nuestro directorio es completamente gratuito para todos los usuarios.
                  No cobramos comisiones ni tarifas por el uso de la plataforma.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿Cómo puedo reportar información incorrecta?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Si encontrás información incorrecta o desactualizada, envianos un email a
                  contacto@encontramecanico.com con los detalles y trabajaremos para corregirla
                  en la próxima actualización.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-8 pb-8">
            <h3 className="text-2xl font-bold text-center mb-4">¿Tenés un taller mecánico?</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto">
              Si sos propietario de un taller y querés asegurarte de que tu información esté
              actualizada en nuestro directorio, o si querés que removamos tu listado, contactanos.
            </p>
            <div className="text-center">
              <a
                href="mailto:talleres@encontramecanico.com"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Mail className="h-4 w-4" />
                talleres@encontramecanico.com
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            Tiempo de respuesta: 24-48 horas
          </div>
        </div>
      </div>
    </div>
  );
}