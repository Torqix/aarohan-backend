'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useRegistrations } from '@/hooks/useRegistrations';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingPage } from '@/components/ui/Loading';
import { Registration } from '@/types';

export default function EventRegistrations({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { event, loading: eventLoading, fetchEvent } = useEvents();
  const {
    registrations,
    loading: registrationsLoading,
    fetchEventRegistrations,
    updateRegistrationStatus,
  } = useRegistrations();
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEvent(params.id);
    fetchEventRegistrations(params.id);
  }, [params.id, fetchEvent, fetchEventRegistrations]);

  const handleStatusUpdate = async (registrationId: string, status: 'approved' | 'rejected') => {
    try {
      setIsUpdating(true);
      await updateRegistrationStatus(registrationId, status);
      await fetchEventRegistrations(params.id);
      setSelectedRegistration(null);
    } catch (error) {
      console.error('Error updating registration status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (eventLoading || registrationsLoading) {
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
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-vercel-blue via-vercel-purple to-vercel-pink bg-clip-text text-transparent">
            Registrations
          </h1>
          <p className="mt-2 text-vercel-gray-300">
            {event.title} - {registrations.length} registrations
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
        >
          Back to Event
        </Button>
      </div>

      {/* Registration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{registrations.length}</div>
            <div className="mt-2">
              <Badge variant="secondary">
                {((registrations.length / event.maxParticipants) * 100).toFixed(1)}% Capacity
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">
                {registrations.filter(r => r.paymentStatus === 'completed').length} Paid
              </Badge>
              <Badge variant="warning">
                {registrations.filter(r => r.paymentStatus === 'pending').length} Pending
              </Badge>
              <Badge variant="destructive">
                {registrations.filter(r => r.paymentStatus === 'failed').length} Failed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">
                {registrations.filter(r => r.status === 'approved').length} Approved
              </Badge>
              <Badge variant="warning">
                {registrations.filter(r => r.status === 'pending').length} Pending
              </Badge>
              <Badge variant="destructive">
                {registrations.filter(r => r.status === 'rejected').length} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex items-center justify-between p-4 rounded-lg bg-vercel-gray-800"
              >
                <div>
                  <h4 className="font-medium text-white">
                    {registration.user.name || registration.user.email}
                  </h4>
                  <div className="flex gap-2 mt-2">
                    <Badge
                      variant={
                        registration.paymentStatus === 'completed'
                          ? 'success'
                          : registration.paymentStatus === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {registration.paymentStatus}
                    </Badge>
                    <Badge
                      variant={
                        registration.status === 'approved'
                          ? 'success'
                          : registration.status === 'pending'
                          ? 'warning'
                          : 'destructive'
                      }
                    >
                      {registration.status}
                    </Badge>
                    {registration.teamName && (
                      <Badge variant="purple">Team: {registration.teamName}</Badge>
                    )}
                  </div>
                  {registration.teamMembers && (
                    <div className="mt-2 text-sm text-vercel-gray-300">
                      Team Members: {registration.teamMembers.join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-vercel-gray-300">
                    {new Date(registration.registeredAt).toLocaleDateString()}
                  </div>
                  {registration.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(registration.id, 'approved')}
                        disabled={isUpdating}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(registration.id, 'rejected')}
                        disabled={isUpdating}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 