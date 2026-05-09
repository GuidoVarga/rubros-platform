'use client';

import { GeolocationButton as GeolocationButtonUI, type GeolocationButtonProps } from '@rubros/ui';
import { useRouter } from 'next/navigation';

export function GeolocationButton(props: GeolocationButtonProps) {
  const router = useRouter();
  return (
    <GeolocationButtonUI
     {...props}
      redirectFunction={(path) => router.push(path)}
    />
  );
}