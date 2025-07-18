'use client';

import { Button } from '@rubros/ui'
import { Phone, Globe, MapPin } from 'lucide-react'
import { trackPhoneClick, trackWebsiteClick, trackGoogleMapsClick } from '@/lib/analytics'

type BusinessActionsProps = {
  businessName: string;
  phone?: string | null;
  website?: string | null;
  googleMapsLink?: string | null;
}

export default function BusinessActions({
  businessName,
  phone,
  website,
  googleMapsLink
}: BusinessActionsProps) {
  const handlePhoneClick = () => {
    if (phone) {
      trackPhoneClick(businessName, phone);
    }
  };

  const handleWebsiteClick = () => {
    if (website) {
      trackWebsiteClick(businessName, website);
    }
  };

  const handleGoogleMapsClick = () => {
    trackGoogleMapsClick(businessName);
  };

  return (
    <div className="flex gap-2 pt-4 flex-wrap">
      {phone && (
        <Button asChild onClick={handlePhoneClick}>
          <a href={`tel:${phone}`}>
            <Phone className="h-4 w-4 mr-2" />
            Llamar
          </a>
        </Button>
      )}
      {website && (
        <Button variant="outline" asChild onClick={handleWebsiteClick}>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4 mr-2" />
            Sitio web
          </a>
        </Button>
      )}
      {googleMapsLink && (
        <Button variant="secondary" asChild onClick={handleGoogleMapsClick}>
          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4 mr-2" />
            Ver en Google Maps
          </a>
        </Button>
      )}
    </div>
  );
}