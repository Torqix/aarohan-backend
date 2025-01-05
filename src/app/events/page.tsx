'use client';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { useEvents } from '@/hooks/useEvents';

export default function EventsPage() {
  const { events, loading } = useEvents();

  return (
    <Container>
      <div className="py-12">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-4">
          Events
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Browse and register for upcoming events at Aarohan
        </p>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <Card className="h-full hover:border-vercel-blue transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {event.title}
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                      {event.date ? new Date(event.date).toLocaleDateString() : 'Invalid Date'}
                    </p>
                    <p className="text-base text-gray-300 mb-4">
                      {event.organizer}
                    </p>
                    <p className="text-sm text-gray-400">
                      {event.maxParticipants} participants max
                    </p>
                  </div>
                  <Badge variant={event.isPaid ? 'warning' : 'success'}>
                    {event.isPaid ? 'Paid' : 'Free'}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Container>
  );
} 