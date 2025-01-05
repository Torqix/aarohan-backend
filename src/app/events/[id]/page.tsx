'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/Loading';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  isPaid: boolean;
  price?: number;
}

export default function EventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const eventRef = doc(db, 'events', id as string);
        const eventDoc = await getDoc(eventRef);
        if (eventDoc.exists()) {
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data()
          } as Event);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!event) {
    return (
      <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-vercel-gray-800 bg-vercel-gray-900 p-8 text-center">
          <p className="text-vercel-gray-400">Event not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 btn btn-outline"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <Card className="overflow-hidden" glass>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge
              variant={
                event.status === 'UPCOMING'
                  ? 'success'
                  : event.status === 'ONGOING'
                  ? 'warning'
                  : 'error'
              }
            >
              {event.status}
            </Badge>
            <Badge variant="secondary">{event.category}</Badge>
          </div>
          <CardTitle className="mt-4 text-3xl" gradient>
            {event.title}
          </CardTitle>
          <CardDescription>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-vercel-gray-400">{event.description}</p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-vercel-gray-300">
                  {event.currentParticipants}/{event.maxParticipants}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-vercel-gray-300">
                  {event.isPaid ? (
                    <span className="flex items-center gap-2">
                      ₹{event.price}
                      <Badge variant="gradient">Paid</Badge>
                    </span>
                  ) : (
                    <Badge variant="success">Free</Badge>
                  )}
                </p>
              </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <Card>
                <CardHeader>
                  <CardTitle>Management</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <button
                    onClick={() => router.push(`/admin/events/${event.id}/edit`)}
                    className="btn btn-outline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/admin/events/${event.id}/registrations`)}
                    className="btn btn-outline"
                  >
                    Registrations
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-4">
          <button
            onClick={() => router.back()}
            className="btn btn-outline"
          >
            Go Back
          </button>
          {user ? (
            <button
              onClick={() => router.push(`/events/${event.id}/register`)}
              className="btn btn-gradient"
              disabled={event.currentParticipants >= event.maxParticipants}
            >
              {event.currentParticipants >= event.maxParticipants
                ? 'Event Full'
                : 'Register Now'}
            </button>
          ) : (
            <button
              onClick={() => router.push('/auth/signin')}
              className="btn btn-gradient"
            >
              Sign in to Register
            </button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
} 