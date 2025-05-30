// app/apollo/provider.tsx
'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode, useEffect, useState } from 'react';
import client, { initializeApollo } from './client';
import { usePathname } from 'next/navigation';

/**
 * A wrapping component to provide Apollo Client to the application.
 * Uses a dynamic import approach to prevent hydration mismatches.
 */
const ApolloWrapper = ({ children }: { children: ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  // Track when we can start client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // On mount, initialize the Apollo client
  useEffect(() => {
    if (mounted) {
      initializeApollo().catch(err => {
        console.error('Failed to initialize Apollo Client:', err);
      });
    }
  }, [mounted]);

  // Always render the children using the default client
  // This ensures server and client rendering match
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

export default ApolloWrapper;