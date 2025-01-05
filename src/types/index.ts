// User Types
export type UserRole = 'admin' | 'user';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'not_required';

export interface User {
  id: string;
  uid?: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Event Types
export type EventCategory = 'technical' | 'cultural' | 'sports' | 'other';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: Date;
  location?: string;
  bannerUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  isPaid: boolean;
  price?: number;
  isTeamEvent: boolean;
  maxTeamSize?: number;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Registration Types
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Team {
  id: string;
  eventId: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  members: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  phone: string;
  college: string;
  poornimaId?: string;
  teamId?: string;
  teamName?: string;
  teamRole?: 'leader' | 'member';
  paymentStatus: PaymentStatus;
  paymentId?: string;
  status: RegistrationStatus;
  registeredAt: Date;
  updatedAt: Date;
  checkedIn?: boolean;
  checkedInAt?: Date;
  checkedInBy?: string;
}

export interface RegistrationWithUser extends Registration {
  user: User;
}

export interface TeamRegistration {
  teamInviteCode: string;
  phone: string;
  college: string;
  poornimaId?: string;
}

export interface CreateRegistration {
  phone: string;
  college: string;
  poornimaId?: string;
  teamName?: string;
}

// Payment Types
export interface Payment {
  id: string;
  registrationId: string;
  userId: string;
  eventId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  createdAt: Date;
  updatedAt: Date;
} 