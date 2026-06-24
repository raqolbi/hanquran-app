'use client';

import { useEffect } from 'react';

import { initStores } from '@/stores';
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
      <IntlProvider>{children}</IntlProvider>
    </ErrorBoundary>
  );
}
