'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'bg-vercel-dark text-white border border-vercel-gray-800',
          duration: 3000,
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </AuthProvider>
  );
} 