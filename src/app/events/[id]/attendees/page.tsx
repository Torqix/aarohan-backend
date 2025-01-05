'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Registration } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/Loading';
import { Container } from '@/components/ui/Container';
import { FiClock, FiUser, FiUsers } from 'react-icons/fi';

interface Props {
  params: {
    id: string;
  };
}

export default function EventAttendees({ params }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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

        // Fetch registrations
        const registrationsQuery = query(
          collection(db, 'registrations'),
          where('eventId', '==', params.id)
        );
        const registrationsSnapshot = await getDocs(registrationsQuery);
        const registrationsData = registrationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registeredAt: doc.data().registeredAt.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          checkedInAt: doc.data().checkedInAt?.toDate(),
        } as Registration));

        setRegistrations(registrationsData);
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

  if (!event) {
    return null;
  }

  const checkedInCount = registrations.filter(r => r.checkedIn).length;

  return (
    <div className="min-h-screen bg-vercel-dark pt-20">
      <Container size="lg">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-vercel-blue via-vercel-purple to-vercel-pink bg-clip-text text-transparent">
              Event Attendees
            </h1>
            <p className="mt-2 text-vercel-gray-300">
              {event.title}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-vercel-blue" />
                  <h3 className="font-medium">Total Registrations</h3>
                </div>
                <p className="mt-2 text-2xl font-bold">{registrations.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-vercel-cyan" />
                  <h3 className="font-medium">Checked In</h3>
                </div>
                <p className="mt-2 text-2xl font-bold">{checkedInCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-vercel-purple" />
                  <h3 className="font-medium">Pending</h3>
                </div>
                <p className="mt-2 text-2xl font-bold">{registrations.length - checkedInCount}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registered Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-vercel-gray-800">
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">User ID</th>
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">Team</th>
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">Payment</th>
                      <th className="text-left py-3 px-4 text-vercel-gray-300 font-medium">Check-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="border-b border-vercel-gray-800">
                        <td className="py-3 px-4 font-mono text-sm">{registration.id}</td>
                        <td className="py-3 px-4">{registration.userId}</td>
                        <td className="py-3 px-4">
                          {registration.teamName ? (
                            <div className="flex gap-2">
                              <Badge variant="purple">{registration.teamName}</Badge>
                              {registration.teamRole && (
                                <Badge variant="secondary">{registration.teamRole}</Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-vercel-gray-300">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
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
                        </td>
                        <td className="py-3 px-4">
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
                              ? 'FREE'
                              : registration.paymentStatus.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {registration.checkedIn ? (
                            <div>
                              <Badge variant="success">CHECKED IN</Badge>
                              <div className="mt-1 text-xs text-vercel-gray-300">
                                {registration.checkedInAt?.toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="secondary">NOT CHECKED IN</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

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