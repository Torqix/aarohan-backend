'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { doc, getDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/hooks/useEvents';
import toast from 'react-hot-toast';

export default function RegisterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (!user.email) {
      toast.error('Please update your profile with an email address.');
      router.push('/profile');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    async function fetchEventData() {
      if (!params.id) return;

      try {
        setLoading(true);
        const eventRef = doc(db, 'events', params.id);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          toast.error('Event not found.');
          router.push('/events');
          return;
        }

        const eventData = eventDoc.data();
        if (!eventData) {
          toast.error('Invalid event data.');
          router.push('/events');
          return;
        }

        setEvent({
          id: eventDoc.id,
          ...eventData
        } as Event);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    }

    fetchEventData();
  }, [params.id, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!user?.email) {
      toast.error('Please sign in with a valid email address.');
      return;
    }

    if (!event) {
      toast.error('Event details not found.');
      return;
    }

    try {
      setSubmitting(true);

      // Create a unique ID for the registration
      const registrationId = `${event.id}_${user.email.replace(/[.@]/g, '_')}`;
      
      // Check if user has already registered
      const registrationRef = doc(db, 'registrations', registrationId);
      const existingReg = await getDoc(registrationRef);
      
      if (existingReg.exists()) {
        toast.error('You have already registered for this event.');
        return;
      }

      const registrationData = {
        id: registrationId,
        eventId: event.id,
        eventTitle: event.title,
        userId: user.email,
        email: user.email,
        status: 'registered',
        paymentStatus: event.isPaid ? 'pending' : 'completed',
        amountPaid: event.isPaid ? event.price : 0,
        registeredAt: serverTimestamp(),
      };

      // Use setDoc with merge option to handle potential conflicts
      await setDoc(registrationRef, registrationData, { merge: true });
      
      toast.success('Registration successful!');
      
      if (event.isPaid) {
        router.push(`/events/${event.id}/payment`);
      } else {
        router.push(`/events/${event.id}`);
      }
    } catch (error: any) {
      console.error('Error registering for event:', error);
      if (error?.code === 'permission-denied') {
        toast.error('You do not have permission to register for this event.');
      } else {
        toast.error('Failed to register. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!user?.email) {
    return null;
  }

  if (loading || !event) {
    return (
      <Container>
        <div className="py-12">
          <Card>
            <div className="p-6 text-center">
              <p className="text-gray-400">Loading event details...</p>
            </div>
          </Card>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              Register for {event.title}
            </h1>
            <p className="text-lg text-gray-400">
              {event.date ? new Date(event.date).toLocaleDateString() : 'Invalid Date'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${event.id}`)}
          >
            Back to Event
          </Button>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Registration Details</h2>
              <div className="space-y-2">
                <p className="text-gray-400">
                  <span className="font-medium text-white">Event:</span> {event.title}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Category:</span> {event.category}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Organizer:</span> {event.organizer}
                </p>
                {event.isPaid && (
                  <p className="text-gray-400">
                    <span className="font-medium text-white">Registration Fee:</span> ₹{event.price}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-4">Participant Information</h3>
              <div className="space-y-2">
                <p className="text-gray-400">
                  <span className="font-medium text-white">Email:</span> {user.email}
                </p>
              </div>
            </div>

            <div className="border-t border-vercel-gray-800 pt-6">
              <div className="flex items-center justify-between">
                <div className="text-gray-400">
                  {event.isPaid ? (
                    <p>You will be redirected to the payment page after registration.</p>
                  ) : (
                    <p>This is a free event.</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Registering...' : 'Confirm Registration'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
} 