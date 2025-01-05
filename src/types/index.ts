export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'paying' | 'non-paying';
  createdAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  maxParticipants: number;
  currentParticipants: number;
  isPaid: boolean;
  price?: number;
  category: string;
  bannerUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus?: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  registeredAt: Date;
}

export interface EventWithRegistration extends Event {
  isRegistered?: boolean;
  registration?: Registration;
} 