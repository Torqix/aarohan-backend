'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  maxParticipants: number;
  isPaid: boolean;
  price?: number;
  category: string;
}

export default function CreateEvent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>();
  const isPaid = watch('isPaid');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    router.push('/events');
    return null;
  }

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      // Create event document
      await addDoc(collection(db, 'events'), {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        maxParticipants: Number(data.maxParticipants),
        currentParticipants: 0,
        isPaid: data.isPaid,
        price: data.isPaid ? Number(data.price) : 0,
        category: data.category,
        bannerUrl: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Event created successfully!');
      router.push('/events');
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-white mb-6">Create New Event</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Event Title
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Event Date
              </label>
              <input
                type="datetime-local"
                {...register('date', { required: 'Date is required' })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Maximum Participants
              </label>
              <input
                type="number"
                {...register('maxParticipants', {
                  required: 'Maximum participants is required',
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-500">{errors.maxParticipants.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Category
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
              >
                <option value="">Select a category</option>
                <option value="technical">Technical</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('isPaid')}
                className="rounded bg-gray-700 border-gray-600 text-indigo-600"
              />
              <label className="ml-2 text-sm text-gray-300">
                This is a paid event
              </label>
            </div>

            {isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Price (₹)
                </label>
                <input
                  type="number"
                  {...register('price', {
                    required: isPaid ? 'Price is required for paid events' : false,
                    min: { value: 0, message: 'Price cannot be negative' },
                  })}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 