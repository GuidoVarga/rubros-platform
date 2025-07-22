'use client';

import { CookieBanner as UICookieBanner } from '@rubros/ui';
import { shouldShowBanner, saveConsent } from '@/lib/cookies';
import Link from 'next/link';

export function CookieBanner() {
  return (
    <UICookieBanner
      shouldShowBanner={shouldShowBanner}
      saveConsent={saveConsent}
      renderLink={({ href, children, className }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    />
  );
}