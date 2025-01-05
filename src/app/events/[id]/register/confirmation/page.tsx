'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Registration } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/Loading';
import { Container } from '@/components/ui/Container';

interface Props {
  params: {
    id: string;
  };
}

export default function RegistrationConfirmation({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          router.push('/');
          return;
        }

        // Fetch event details
        const eventDoc = await getDoc(doc(db, 'events', params.id));
        if (!eventDoc.exists()) {
          router.push('/events');
          return;
        }

        const eventData = eventDoc.data();
        setEvent({
          id: eventDoc.id,
          ...eventData,
          date: eventData.date.toDate(),
          createdAt: eventData.createdAt.toDate(),
          updatedAt: eventData.updatedAt.toDate(),
        } as Event);

        // Fetch registration details
        const registrationId = `${params.id}_${user.id}`;
        const registrationDoc = await getDoc(doc(db, 'registrations', registrationId));
        if (!registrationDoc.exists()) {
          router.push(`/events/${params.id}`);
          return;
        }

        const registrationData = registrationDoc.data();
        setRegistration({
          id: registrationDoc.id,
          ...registrationData,
          registeredAt: registrationData.registeredAt.toDate(),
          updatedAt: registrationData.updatedAt?.toDate(),
        } as Registration);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, user, router]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!event || !registration) {
    return null;
  }

  // Create QR code data
  const qrData = JSON.stringify({
    eventId: event.id,
    registrationId: registration.id,
    userId: user?.id,
    timestamp: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen bg-vercel-dark pt-20">
      <Container size="sm">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-vercel-blue via-vercel-purple to-vercel-pink bg-clip-text text-transparent">
              Registration Confirmed
            </h1>
            <p className="mt-2 text-vercel-gray-300">
              You have successfully registered for {event.title}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-vercel-gray-300">Event</h3>
                <p className="mt-1 text-white">{event.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-vercel-gray-300">Date & Time</h3>
                <p className="mt-1 text-white">
                  {event.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-white">
                  {event.date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-vercel-gray-300">Registration Status</h3>
                <div className="mt-1">
                  <Badge
                    variant={
                      registration.status === 'approved'
                        ? 'success'
                        : registration.status === 'pending'
                        ? 'warning'
                        : 'destructive'
                    }
                  >
                    {registration.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-vercel-gray-300">Payment Status</h3>
                <div className="mt-1">
                  <Badge
                    variant={
                      registration.paymentStatus === 'completed'
                        ? 'success'
                        : registration.paymentStatus === 'pending'
                        ? 'warning'
                        : registration.paymentStatus === 'not_required'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {registration.paymentStatus === 'not_required'
                      ? 'FREE EVENT'
                      : registration.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {registration.teamName && (
                <div>
                  <h3 className="text-sm font-medium text-vercel-gray-300">Team</h3>
                  <p className="mt-1 text-white">{registration.teamName}</p>
                  {registration.teamRole && (
                    <Badge variant="purple" className="mt-2">
                      {registration.teamRole.toUpperCase()}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Card>
              <CardHeader>
                <CardTitle>Registration ID</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-lg font-mono bg-vercel-gray-800 px-4 py-2 rounded-md">
                  {registration.id}
                </p>
                <p className="mt-4 text-center text-sm text-vercel-gray-300">
                  Please save this registration ID. You will need it for event check-in.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              variant="gradient"
              onClick={() => router.push('/events')}
            >
              Back to Events
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
} 