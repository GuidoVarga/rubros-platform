// Google Analytics 4 implementation
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID!, {
      page_location: url,
    });
  }
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Eventos específicos para nuestro directorio de mecánicos
export const trackBusinessView = (
  businessName: string,
  city: string,
  province: string
) => {
  event(
    'view_business',
    'business_interaction',
    `${businessName} - ${city}, ${province}`
  );
};

export const trackPhoneClick = (businessName: string, phone: string) => {
  event('click_phone', 'contact', `${businessName} - ${phone}`);
};

export const trackWebsiteClick = (businessName: string, website: string) => {
  event('click_website', 'contact', `${businessName} - ${website}`);
};

export const trackGoogleMapsClick = (businessName: string) => {
  event('click_google_maps', 'contact', businessName);
};

export const trackLocationRequest = (city?: string, province?: string) => {
  const location = city && province ? `${city}, ${province}` : 'unknown';
  event('request_location', 'geolocation', location);
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event('search', 'directory_search', searchTerm, resultsCount);
};

export const trackFilterUse = (filterType: string, filterValue: string) => {
  event('use_filter', 'directory_filter', `${filterType}: ${filterValue}`);
};
