'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Toaster position="top-center" />
      {children}
    </AuthProvider>
  );
} 