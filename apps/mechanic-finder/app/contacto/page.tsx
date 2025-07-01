import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@rubros/ui';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { ORGANIZATION } from '@/constants/org';

export const metadata: Metadata = {
  title: 'Contacto - Encontra Mecánico',
  description: 'Ponte en contacto con nuestro equipo. Resolvemos tus dudas sobre mecánicos y talleres en Argentina.',
};

export default function ContactPage() {
  return (
    <div className="container py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contacto</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ¿Tenés alguna consulta? Nuestro equipo está disponible para ayudarte a encontrar el mejor servicio mecánico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@encontramecanico.com" className="text-primary hover:underline">
                      info@encontramecanico.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <a href="tel:+5411234567890" className="text-primary hover:underline">
                      +54 11 2345-6789
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium">Oficinas</p>
                    <p className="text-muted-foreground">Buenos Aires, Argentina</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Horarios de atención</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Lunes a Viernes:</span> 9:00 - 18:00</p>
                  <p><span className="font-medium">Sábados:</span> 9:00 - 13:00</p>
                  <p><span className="font-medium">Domingos:</span> Cerrado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">¿Cómo puedo agregar mi taller a la plataforma?</h4>
                <p className="text-sm text-muted-foreground">
                  Envianos un email con la información de tu taller y nos pondremos en contacto para el proceso de verificación.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">¿Los servicios son gratuitos para los usuarios?</h4>
                <p className="text-sm text-muted-foreground">
                  Sí, la búsqueda y contacto con mecánicos es completamente gratuita para los usuarios.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">¿Cómo verifican a los mecánicos?</h4>
                <p className="text-sm text-muted-foreground">
                  Verificamos documentación, experiencia y realizamos controles de calidad periódicos.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">¿Puedo dejar reseñas?</h4>
                <p className="text-sm text-muted-foreground">
                  Próximamente implementaremos un sistema de reseñas verificadas para mejorar la experiencia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-2">¿Sos mecánico y querés sumarte?</h3>
              <p className="text-muted-foreground mb-4">
                Únite a nuestra red de profesionales verificados y aumentá tu visibilidad.
              </p>
              <a
                href="mailto:talleres@encontramecanico.com?subject=Quiero sumar mi taller"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contactar
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}