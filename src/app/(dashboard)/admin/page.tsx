'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { events, loading } = useEvents();
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const registrationsRef = collection(db, 'registrations');
        const registrationsSnapshot = await getDocs(registrationsRef);
        const registrations = registrationsSnapshot.docs.map(doc => doc.data());
        
        const totalRegistrations = registrations.length;
        const totalRevenue = registrations.reduce((acc, reg) => acc + (reg.amountPaid || 0), 0);

        setStats({
          totalRegistrations,
          totalRevenue,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }

    fetchStats();
  }, []);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <Button onClick={() => router.push('/admin/events/create')}>
            Create Event
          </Button>
        </div>

        <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Total Events</h3>
              <p className="mt-2 text-3xl font-semibold text-white">{events.length}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Total Registrations</h3>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.totalRegistrations}</p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
              <p className="mt-2 text-3xl font-semibold text-white">₹{stats.totalRevenue}</p>
            </div>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Events</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:border-vercel-blue transition-colors">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{event.title}</h3>
                  <Badge variant={event.isPaid ? 'warning' : 'success'}>
                    {event.isPaid ? 'Paid' : 'Free'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  {event.date ? new Date(event.date).toLocaleDateString() : 'Invalid Date'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    {event.maxParticipants} participants max
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/events/${event.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
} 