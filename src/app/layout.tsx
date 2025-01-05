import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aarohan',
  description: 'College Fest Event Registration Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <AuthProvider>
          <Navigation />
          <main className="pt-16">
            {children}
          </main>
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
