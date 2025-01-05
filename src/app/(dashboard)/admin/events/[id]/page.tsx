'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/hooks/useEvents';

interface Registration {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  paymentStatus: string;
  amountPaid: number;
  registeredAt: string;
  email: string;
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchEventData() {
      try {
        setLoading(true);
        // Fetch event details
        const eventRef = doc(db, 'events', params.id);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          router.push('/admin');
          return;
        }

        setEvent({
          id: eventDoc.id,
          ...eventDoc.data()
        } as Event);

        // Fetch registrations for this event
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('eventId', '==', params.id));
        const registrationsSnapshot = await getDocs(q);
        
        const registrationsData = registrationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Registration[];

        setRegistrations(registrationsData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchEventData();
    }
  }, [params.id, router]);

  if (!user || user.role !== 'admin' || !event) {
    return null;
  }

  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              {event.title}
            </h1>
            <p className="text-lg text-gray-400">
              {event.date ? new Date(event.date).toLocaleDateString() : 'Invalid Date'}
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/admin/events/${event.id}/edit`)}
            >
              Edit Event
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Status</h3>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={event.isPaid ? 'warning' : 'success'}>
                  {event.isPaid ? 'Paid' : 'Free'}
                </Badge>
                <Badge variant="secondary">
                  {event.category}
                </Badge>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Registrations</h3>
              <p className="mt-2 text-3xl font-semibold text-white">
                {registrations.length} / {event.maxParticipants}
              </p>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-400">Revenue</h3>
              <p className="mt-2 text-3xl font-semibold text-white">
                ₹{registrations.reduce((acc, reg) => acc + (reg.amountPaid || 0), 0)}
              </p>
            </div>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Registrations</h2>
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Registration ID</p>
                    <p className="text-lg font-medium text-white">{registration.id}</p>
                  </div>
                  <Badge variant={
                    registration.paymentStatus === 'completed' ? 'success' :
                    registration.paymentStatus === 'pending' ? 'warning' : 'error'
                  }>
                    {registration.paymentStatus}
                  </Badge>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-base text-white">{registration.email}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Registered On</p>
                    <p className="text-base text-white">
                      {new Date(registration.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                  {event.isPaid && (
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Amount Paid</p>
                      <p className="text-base text-white">₹{registration.amountPaid}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {registrations.length === 0 && (
            <Card>
              <div className="p-6 text-center">
                <p className="text-gray-400">No registrations yet</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Container>
  );
} 