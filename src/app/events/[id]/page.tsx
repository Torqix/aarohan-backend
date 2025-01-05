'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
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
  // ... (keep existing state and useEffect)

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

  // ... (keep existing render code)
} 