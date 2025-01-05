'use client';

import { useAuth } from '@/contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Image from 'next/image';

export default function Home() {
  const { user, loading } = useAuth();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user is from Poornima University
      const isPoornimaStudent = result.user.email?.endsWith('@poornima.org');
      
      // Create or update user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: isPoornimaStudent ? 'non-paying' : 'paying',
        createdAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome to AarohanR
            </h1>
            <p className="mt-3 text-xl text-gray-300">
              Your College Fest Event Registration Platform
            </p>
          </div>

          {!user ? (
            <div className="mt-8">
              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-3 md:text-lg md:px-6"
              >
                <Image
                  src="/google-icon.svg"
                  alt="Google"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                Sign in with Google
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="text-xl">
                Welcome back, {user.displayName}!
              </p>
              <p className="text-gray-300">
                You are registered as a {user.role} user.
              </p>
              <a
                href="/events"
                className="inline-block w-full px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-3 md:text-lg md:px-6"
              >
                Browse Events
              </a>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-400">
        <p>&copy; 2024 AarohanR. All rights reserved.</p>
      </footer>
    </div>
  );
}
