'use client';

import { useEffect } from 'react';
import { trackBusinessView } from '@/lib/analytics';

type BusinessViewTrackerProps = {
  businessName: string;
  city: string;
  province: string;
}

export default function BusinessViewTracker({
  businessName,
  city,
  province
}: BusinessViewTrackerProps) {
  useEffect(() => {
    // Track business view on component mount
    trackBusinessView(businessName, city, province);
  }, [businessName, city, province]);

  return null; // This component doesn't render anything
}