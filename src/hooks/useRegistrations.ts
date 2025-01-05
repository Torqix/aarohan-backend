import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  DocumentData,
} from 'firebase/firestore';
import {
  Registration,
  RegistrationWithUser,
  CreateRegistration,
  TeamRegistration,
  Team,
  User,
} from '@/types';
import { nanoid } from 'nanoid';

export interface UseRegistrationsReturn {
  registrations: RegistrationWithUser[];
  loading: boolean;
  fetchEventRegistrations: (eventId: string) => Promise<void>;
  createRegistration: (eventId: string, data: CreateRegistration) => Promise<string>;
  joinTeam: (eventId: string, data: TeamRegistration) => Promise<string>;
  updateRegistrationStatus: (registrationId: string, status: 'approved' | 'rejected') => Promise<void>;
}

export function useRegistrations(): UseRegistrationsReturn {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEventRegistrations = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('eventId', '==', eventId));
      const querySnapshot = await getDocs(q);

      const registrationsData: RegistrationWithUser[] = [];
      for (const docSnapshot of querySnapshot.docs) {
        const registration = docSnapshot.data() as Registration;
        const userRef = doc(db, 'users', registration.userId);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data() as DocumentData;

        registrationsData.push({
          ...registration,
          id: docSnapshot.id,
          user: {
            id: userDoc.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            createdAt: userData.createdAt.toDate(),
            updatedAt: userData.updatedAt.toDate(),
          },
        });
      }

      setRegistrations(registrationsData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createRegistration = useCallback(async (eventId: string, data: CreateRegistration) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);

      // Check if user is already registered
      const existingRegistration = await checkExistingRegistration(eventId, user.id);
      if (existingRegistration) {
        throw new Error('You are already registered for this event');
      }

      let teamId: string | undefined;
      let teamRole: 'leader' | 'member' | undefined;

      // If creating a team
      if (data.teamName) {
        const teamRef = await addDoc(collection(db, 'teams'), {
          eventId,
          name: data.teamName,
          inviteCode: nanoid(8),
          leaderId: user.id,
          members: [user.id],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        teamId = teamRef.id;
        teamRole = 'leader';
      }

      // Create registration
      const registrationRef = await addDoc(collection(db, 'registrations'), {
        eventId,
        userId: user.id,
        phone: data.phone,
        college: data.college,
        poornimaId: data.poornimaId,
        teamId,
        teamName: data.teamName,
        teamRole,
        paymentStatus: 'pending',
        status: 'pending',
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update event participant count
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        currentParticipants: increment(1),
      });

      return registrationRef.id;
    } catch (error) {
      console.error('Error creating registration:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const joinTeam = useCallback(async (eventId: string, data: TeamRegistration) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);

      // Check if user is already registered
      const existingRegistration = await checkExistingRegistration(eventId, user.id);
      if (existingRegistration) {
        throw new Error('You are already registered for this event');
      }

      // Find team by invite code
      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        where('eventId', '==', eventId),
        where('inviteCode', '==', data.teamInviteCode)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Invalid team invite code');
      }

      const teamDoc = querySnapshot.docs[0];
      const team = teamDoc.data() as Team;

      // Check if team is full
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      const eventData = eventDoc.data();
      if (!eventData) {
        throw new Error('Event not found');
      }

      if (team.members.length >= (eventData.maxTeamSize || 1)) {
        throw new Error('Team is full');
      }

      // Add user to team
      await updateDoc(teamDoc.ref, {
        members: [...team.members, user.id],
        updatedAt: serverTimestamp(),
      });

      // Create registration
      const registrationRef = await addDoc(collection(db, 'registrations'), {
        eventId,
        userId: user.id,
        phone: data.phone,
        college: data.college,
        poornimaId: data.poornimaId,
        teamId: teamDoc.id,
        teamName: team.name,
        teamRole: 'member',
        paymentStatus: 'pending',
        status: 'pending',
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update event participant count
      await updateDoc(eventRef, {
        currentParticipants: increment(1),
      });

      return registrationRef.id;
    } catch (error) {
      console.error('Error joining team:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateRegistrationStatus = useCallback(async (registrationId: string, status: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      const registrationRef = doc(db, 'registrations', registrationId);
      await updateDoc(registrationRef, {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating registration status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    registrations,
    loading,
    fetchEventRegistrations,
    createRegistration,
    joinTeam,
    updateRegistrationStatus,
  };
}

async function checkExistingRegistration(eventId: string, userId: string): Promise<boolean> {
  const registrationsRef = collection(db, 'registrations');
  const q = query(
    registrationsRef,
    where('eventId', '==', eventId),
    where('userId', '==', userId)
  );
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
} 