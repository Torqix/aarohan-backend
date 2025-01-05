'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event, Registration } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Props {
  params: {
    id: string;
  };
}

export default function EventDetail({ params }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEventAndRegistration = async () => {
      try {
        // Fetch event details
        const eventDoc = await getDoc(doc(db, 'events', params.id));
        if (!eventDoc.exists()) {
          toast.error('Event not found');
          router.push('/events');
          return;
        }

        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
          date: eventDoc.data().date.toDate(),
          createdAt: eventDoc.data().createdAt.toDate(),
          updatedAt: eventDoc.data().updatedAt.toDate(),
        } as Event;
        setEvent(eventData);

        // If user is logged in, check if they're already registered
        if (user) {
          // Use a consistent registration ID format
          const registrationId = `${params.id}_${user.uid}`;
          const registrationDoc = await getDoc(doc(db, 'registrations', registrationId));
          if (registrationDoc.exists()) {
            const regData = registrationDoc.data();
            setRegistration({
              id: registrationDoc.id,
              ...regData,
              registeredAt: regData.registeredAt.toDate(),
            } as Registration);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchEventAndRegistration();
    }
  }, [params.id, user, loading, router]);

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

      // Create registration document with a specific ID
      const registrationData = {
        id: registrationId,
        eventId: event.id,
        userId: user.uid,
        status: 'confirmed',
        registeredAt: serverTimestamp(),
        paymentStatus: event.isPaid ? 'pending' : 'not_required',
      };

      // Use setDoc with merge option to ensure we don't create duplicates
      await setDoc(doc(db, 'registrations', registrationId), registrationData, { merge: true });
      
      // Set the registration state with the correct date conversion
      setRegistration({
        ...registrationData,
        registeredAt: new Date(),
      } as Registration);

      toast.success('Successfully registered for the event!');
    } catch (error) {
      console.error('Error registering for event:', error);
      toast.error('Failed to register for event');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Event Banner */}
      {event.bannerUrl && (
        <div className="relative h-64 lg:h-96">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200">
                {new Date(event.date).toLocaleDateString()} at{' '}
                {new Date(event.date).toLocaleTimeString()}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-200">
                {event.currentParticipants}/{event.maxParticipants} spots filled
              </span>
              {event.isPaid ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Paid Event - ₹{event.price}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Free Event
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {event.category}
              </span>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-white">Description</h2>
              <p className="mt-2 text-gray-300 whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Registration Status */}
            <div className="mt-8">
              {registration ? (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 opacity-75 cursor-not-allowed"
                >
                  Registered
                </button>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || event.currentParticipants >= event.maxParticipants}
                  className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering
                    ? 'Registering...'
                    : event.currentParticipants >= event.maxParticipants
                    ? 'Event Full'
                    : 'Register Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 