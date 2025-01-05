import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  status: string;
  maxParticipants: number;
  isPaid: boolean;
  price?: number;
  organizer: string;
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, orderBy('date', 'asc'));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading };
} 