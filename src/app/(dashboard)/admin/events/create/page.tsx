'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || user.role !== 'admin') return;

    try {
      setLoading(true);
      const formData = new FormData(event.currentTarget);
      
      const eventData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: new Date(formData.get('date') as string).toISOString(),
        category: formData.get('category'),
        maxParticipants: parseInt(formData.get('maxParticipants') as string),
        isPaid: formData.get('isPaid') === 'true',
        price: parseInt(formData.get('price') as string) || 0,
        organizer: formData.get('organizer'),
        status: 'upcoming',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);
      toast.success('Event created successfully!');
      router.push(`/admin/events/${docRef.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container>
      <div className="py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Create Event
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
          >
            Cancel
          </Button>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400">
                Event Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 form-input"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={4}
                className="mt-1 form-input"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-400">
                Event Date
              </label>
              <input
                type="datetime-local"
                name="date"
                id="date"
                required
                className="mt-1 form-input"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-400">
                Category
              </label>
              <select
                name="category"
                id="category"
                required
                className="mt-1 form-select"
              >
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
              </select>
            </div>

            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-400">
                Organizer
              </label>
              <input
                type="text"
                name="organizer"
                id="organizer"
                required
                className="mt-1 form-input"
                placeholder="Enter organizer name"
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-400">
                Maximum Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                id="maxParticipants"
                required
                min="1"
                className="mt-1 form-input"
              />
            </div>

            <div>
              <label htmlFor="isPaid" className="block text-sm font-medium text-gray-400">
                Event Type
              </label>
              <select
                name="isPaid"
                id="isPaid"
                required
                className="mt-1 form-select"
              >
                <option value="false">Free</option>
                <option value="true">Paid</option>
              </select>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-400">
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                min="0"
                className="mt-1 form-input"
                placeholder="Enter price (if paid event)"
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
} 