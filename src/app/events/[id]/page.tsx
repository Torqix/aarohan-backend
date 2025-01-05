interface Props {
  params: {
    id: string;
  };
}

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Registration } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function EventDetail({ params }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, 'events', params.id));
        if (eventDoc.exists()) {
          setEvent({
            id: eventDoc.id,
            ...eventDoc.data(),
            date: eventDoc.data().date.toDate(),
            createdAt: eventDoc.data().createdAt.toDate(),
            updatedAt: eventDoc.data().updatedAt.toDate(),
          } as Event);

          // If user is logged in, check if they're registered
          if (user) {
            const registrationId = `${params.id}_${user.uid}`;
            const registrationDoc = await getDoc(doc(db, 'registrations', registrationId));
            if (registrationDoc.exists()) {
              setRegistration({
                id: registrationDoc.id,
                ...registrationDoc.data(),
                registeredAt: registrationDoc.data().registeredAt.toDate(),
              } as Registration);
            }
          }
        } else {
          toast.error('Event not found');
          router.push('/events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      }
    };

    fetchEvent();
  }, [params.id, user]);

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please sign in to register for events');
      router.push('/');
      return;
    }

    if (!event) return;

    try {
      setIsRegistering(true);

      // Check if event is full
      if (event.currentParticipants >= event.maxParticipants) {
        toast.error('Event is already full');
        return;
      }

      // Check if already registered
      const registrationId = `${event.id}_${user.uid}`;
      const registrationDoc = await getDoc(doc(db, 'registrations', registrationId));
      
      if (registrationDoc.exists()) {
        toast.error('You are already registered for this event');
        setRegistration({
          id: registrationDoc.id,
          ...registrationDoc.data(),
          registeredAt: registrationDoc.data().registeredAt.toDate(),
        } as Registration);
        return;
      }

      // Use a transaction to update both registration and event participant count
      await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', event.id);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) {
          throw new Error('Event does not exist!');
        }

        const currentData = eventDoc.data();
        if (currentData.currentParticipants >= currentData.maxParticipants) {
          throw new Error('Event is full');
        }

        // Create registration document
        const registrationData = {
          id: registrationId,
          eventId: event.id,
          userId: user.uid,
          status: 'confirmed',
          registeredAt: serverTimestamp(),
          paymentStatus: event.isPaid ? 'pending' : 'not_required',
        };

        // Update event participant count
        transaction.update(eventRef, {
          currentParticipants: currentData.currentParticipants + 1,
          updatedAt: serverTimestamp(),
        });

        // Create registration
        transaction.set(doc(db, 'registrations', registrationId), registrationData);

        // Update local state
        setRegistration({
          ...registrationData,
          registeredAt: new Date(),
        } as Registration);

        // Update local event state
        setEvent(prev => prev ? {
          ...prev,
          currentParticipants: prev.currentParticipants + 1,
        } : null);
      });

      toast.success('Successfully registered for the event!');
    } catch (error: any) {
      console.error('Error registering for event:', error);
      toast.error(error.message || 'Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Event details UI */}
    </div>
  );
} 