'use client';

import { ContactActions } from '@rubros/ui';
import { trackPhoneClick, trackWebsiteClick, trackGoogleMapsClick } from '@/lib/analytics';

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
  return (
    <ContactActions
      businessName={businessName}
      phone={phone}
      website={website}
      googleMapsLink={googleMapsLink}
      onPhoneClick={(name, phoneNumber) => trackPhoneClick(name, phoneNumber)}
      onWebsiteClick={(name, websiteUrl) => trackWebsiteClick(name, websiteUrl)}
      onMapClick={(name) => trackGoogleMapsClick(name)}
    />
  );
}