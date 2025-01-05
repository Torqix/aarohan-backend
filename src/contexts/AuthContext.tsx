'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { LoadingPage } from '@/components/ui/Loading';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (!userDoc.exists()) {
            // Create new user document
            const userData: Omit<User, 'id'> = {
              email: firebaseUser.email!,
              name: firebaseUser.displayName || undefined,
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              ...userData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setUser({ id: firebaseUser.uid, ...userData });
          } else {
            // Use existing user document
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error setting up auth state:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 