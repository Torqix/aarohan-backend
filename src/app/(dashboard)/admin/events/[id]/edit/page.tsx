'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingPage } from '@/components/ui/Loading';
import { toast } from 'react-hot-toast';

type EventFormData = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'>;

export default function EditEvent({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { event, loading, updateEvent, deleteEvent } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>();

  const isPaid = watch('isPaid');
  const isTeamEvent = watch('isTeamEvent');

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        category: event.category,
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        maxParticipants: event.maxParticipants,
        isPaid: event.isPaid,
        price: event.price,
        isTeamEvent: event.isTeamEvent,
        maxTeamSize: event.maxTeamSize,
        bannerUrl: event.bannerUrl,
        status: event.status,
      });
    }
  }, [event, reset]);

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      const eventData = {
        ...data,
        date: new Date(data.date),
        price: data.isPaid ? Number(data.price) : undefined,
        maxTeamSize: data.isTeamEvent ? Number(data.maxTeamSize) : undefined,
      };

      await updateEvent(params.id, eventData);
      toast.success('Event updated successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteEvent(params.id);
      toast.success('Event deleted successfully!');
      router.push('/admin');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-vercel-gray-300">Event not found</h2>
        <Button
          className="mt-4"
          variant="outline"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-vercel-blue via-vercel-purple to-vercel-pink bg-clip-text text-transparent">
          Edit Event
        </h1>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Event'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Category
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  {...register('date', { required: 'Date is required' })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={4}
                className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-vercel-pink">{errors.description.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Capacity & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Maximum Participants
                </label>
                <input
                  type="number"
                  {...register('maxParticipants', {
                    required: 'Maximum participants is required',
                    min: { value: 1, message: 'Must be at least 1' },
                  })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
                {errors.maxParticipants && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isPaid')}
                    className="rounded bg-vercel-gray-800 border-vercel-gray-700 text-vercel-blue"
                  />
                  <label className="ml-2 text-sm text-vercel-gray-300">
                    This is a paid event
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('isTeamEvent')}
                    className="rounded bg-vercel-gray-800 border-vercel-gray-700 text-vercel-blue"
                  />
                  <label className="ml-2 text-sm text-vercel-gray-300">
                    Team event
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Fields */}
            {isPaid && (
              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  {...register('price', {
                    required: 'Price is required for paid events',
                    min: { value: 0, message: 'Price cannot be negative' },
                  })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.price.message}</p>
                )}
              </div>
            )}

            {isTeamEvent && (
              <div>
                <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                  Maximum Team Size
                </label>
                <input
                  type="number"
                  {...register('maxTeamSize', {
                    required: 'Team size is required for team events',
                    min: { value: 2, message: 'Team size must be at least 2' },
                  })}
                  className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
                />
                {errors.maxTeamSize && (
                  <p className="mt-1 text-sm text-vercel-pink">{errors.maxTeamSize.message}</p>
                )}
              </div>
            )}

            {/* Banner URL */}
            <div>
              <label className="block text-sm font-medium text-vercel-gray-300 mb-1">
                Banner URL (Optional)
              </label>
              <input
                type="url"
                {...register('bannerUrl')}
                placeholder="https://postimages.org/..."
                className="w-full rounded-lg bg-vercel-gray-800 border-vercel-gray-700 text-white"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 