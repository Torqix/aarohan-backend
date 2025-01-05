'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Registration } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/Loading';
import { Container } from '@/components/ui/Container';
import { toast } from 'react-hot-toast';

interface Props {
  params: {
    id: string;
  };
}

export default function EventCheckIn({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [registrationId, setRegistrationId] = useState('');
  const [lastScannedRegistration, setLastScannedRegistration] = useState<Registration | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        if (!user) {
          router.push('/');
          return;
        }

        // Verify user is an admin
        if (user.role !== 'admin') {
          router.push('/events');
          return;
        }

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
      } catch (error) {
        console.error('Error fetching event:', error);
        router.push('/events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [params.id, user, router]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim()) {
      toast.error('Please enter a registration ID');
      return;
    }

    try {
      setIsChecking(true);

      // Fetch registration details
      const registrationDoc = await getDoc(doc(db, 'registrations', registrationId));
      if (!registrationDoc.exists()) {
        toast.error('Registration not found');
        return;
      }

      const registrationData = registrationDoc.data();
      const registration = {
        id: registrationDoc.id,
        ...registrationData,
        registeredAt: registrationData.registeredAt.toDate(),
        updatedAt: registrationData.updatedAt?.toDate(),
      } as Registration;

      // Verify this is for the current event
      if (registration.eventId !== params.id) {
        toast.error('Invalid registration ID for this event');
        return;
      }

      // Verify registration status
      if (registration.status !== 'approved') {
        toast.error('Registration is not approved');
        return;
      }

      // Verify payment status
      if (registration.paymentStatus !== 'completed' && registration.paymentStatus !== 'not_required') {
        toast.error('Payment is pending');
        return;
      }

      // Update check-in status
      await updateDoc(doc(db, 'registrations', registration.id), {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy: user?.id,
      });

      setLastScannedRegistration(registration);
      setRegistrationId('');
      toast.success('Check-in successful');
    } catch (error) {
      console.error('Error processing check-in:', error);
      toast.error('Failed to process check-in');
    } finally {
      setIsChecking(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-vercel-dark pt-20">
      <Container size="sm">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-vercel-blue via-vercel-purple to-vercel-pink bg-clip-text text-transparent">
              Event Check-in
            </h1>
            <p className="mt-2 text-vercel-gray-300">
              {event.title}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Check-in Participant</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckIn} className="space-y-4">
                <div>
                  <label htmlFor="registrationId" className="block text-sm font-medium text-vercel-gray-300">
                    Registration ID
                  </label>
                  <input
                    type="text"
                    id="registrationId"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    className="mt-1 block w-full rounded-md bg-vercel-gray-800 border border-vercel-gray-700 text-white px-3 py-2 focus:border-vercel-blue focus:ring-1 focus:ring-vercel-blue"
                    placeholder="Enter registration ID"
                    disabled={isChecking}
                  />
                </div>
                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full"
                  disabled={isChecking}
                >
                  {isChecking ? 'Checking...' : 'Check In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {lastScannedRegistration && (
            <Card>
              <CardHeader>
                <CardTitle>Last Check-in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-vercel-gray-300">Participant</h3>
                  <p className="mt-1 text-white">{lastScannedRegistration.userId}</p>
                  {lastScannedRegistration.teamName && (
                    <div className="mt-2">
                      <Badge variant="purple">
                        {lastScannedRegistration.teamName}
                      </Badge>
                      {lastScannedRegistration.teamRole && (
                        <Badge variant="secondary" className="ml-2">
                          {lastScannedRegistration.teamRole}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-vercel-gray-300">Registration Status</h3>
                  <div className="mt-1">
                    <Badge variant="success">CHECKED IN</Badge>
                    <span className="ml-2 text-sm text-vercel-gray-300">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${params.id}`)}
            >
              Back to Event
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
} 