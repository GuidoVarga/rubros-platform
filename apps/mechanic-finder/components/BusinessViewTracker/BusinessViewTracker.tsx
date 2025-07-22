'use client';

import { ViewTracker } from '@rubros/ui';
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
  return (
    <ViewTracker
      onView={() => trackBusinessView(businessName, city, province)}
      dependencies={[businessName, city, province]}
    />
  );
}