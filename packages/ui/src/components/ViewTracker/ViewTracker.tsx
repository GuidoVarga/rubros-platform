'use client';

import { useEffect } from 'react';

type ViewTrackerProps = {
  onView: () => void;
  trackOnMount?: boolean;
  dependencies?: any[];
};

export function ViewTracker({
  onView,
  trackOnMount = true,
  dependencies = []
}: ViewTrackerProps) {
  useEffect(() => {
    if (trackOnMount) {
      onView();
    }
  }, dependencies);

  return null; // This component doesn't render anything
}