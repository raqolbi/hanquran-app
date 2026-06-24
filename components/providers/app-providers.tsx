'use client';

import { useEffect } from 'react';

import { initStores } from '@/stores';
import { AccessibilityProvider } from '@/components/providers/accessibility-provider';
import { IntlProvider } from '@/components/providers/intl-provider';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { registerServiceWorker } from '@/lib/register-service-worker';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    void initStores();
    void registerServiceWorker();
  }, []);

  return (
    <ErrorBoundary>
      <IntlProvider>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </IntlProvider>
    </ErrorBoundary>
  );
}
