import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'AarohanR - College Fest Event Registration',
  description: 'Register for college fest events at Poornima University',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className={`${inter.className} h-full text-white`}>
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
