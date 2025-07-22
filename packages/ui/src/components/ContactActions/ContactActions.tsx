'use client';

import { Button } from '../Button/button';
import { Phone, Globe, MapPin } from 'lucide-react';

type ContactActionsProps = {
  businessName: string;
  phone?: string | null;
  website?: string | null;
  googleMapsLink?: string | null;
  onPhoneClick?: (businessName: string, phone: string) => void;
  onWebsiteClick?: (businessName: string, website: string) => void;
  onMapClick?: (businessName: string) => void;
  className?: string;
  texts?: {
    phone?: string;
    website?: string;
    map?: string;
  };
};

export function ContactActions({
  businessName,
  phone,
  website,
  googleMapsLink,
  onPhoneClick,
  onWebsiteClick,
  onMapClick,
  className = "flex gap-2 pt-4 flex-wrap",
  texts = {
    phone: 'Llamar',
    website: 'Sitio web',
    map: 'Ver en Google Maps'
  }
}: ContactActionsProps) {
  const handlePhoneClick = () => {
    if (phone && onPhoneClick) {
      onPhoneClick(businessName, phone);
    }
  };

  const handleWebsiteClick = () => {
    if (website && onWebsiteClick) {
      onWebsiteClick(businessName, website);
    }
  };

  const handleMapClick = () => {
    if (onMapClick) {
      onMapClick(businessName);
    }
  };

  return (
    <div className={className}>
      {phone && (
        <Button asChild onClick={handlePhoneClick}>
          <a href={`tel:${phone}`}>
            <Phone className="h-4 w-4 mr-2" />
            {texts.phone}
          </a>
        </Button>
      )}
      {website && (
        <Button variant="outline" asChild onClick={handleWebsiteClick}>
          <a href={website} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4 mr-2" />
            {texts.website}
          </a>
        </Button>
      )}
      {googleMapsLink && (
        <Button variant="secondary" asChild onClick={handleMapClick}>
          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
            <MapPin className="h-4 w-4 mr-2" />
            {texts.map}
          </a>
        </Button>
      )}
    </div>
  );
}