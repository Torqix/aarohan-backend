'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LoadingPage } from '@/components/ui/Loading';
import { Container } from '@/components/ui/Container';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user || user.role !== 'admin') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-vercel-dark pt-20">
      <Container>
        <div className="space-y-6">
          {children}
        </div>
      </Container>
    </div>
  );
} 