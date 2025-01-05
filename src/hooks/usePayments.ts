import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Payment } from '@/types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface UsePaymentsReturn {
  loading: boolean;
  initiatePayment: (registrationId: string, amount: number) => Promise<void>;
  verifyPayment: (paymentId: string, orderId: string, signature: string) => Promise<void>;
}

export function usePayments(): UsePaymentsReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const initiatePayment = useCallback(async (registrationId: string, amount: number) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);

      // Create a new payment document
      const paymentRef = await addDoc(collection(db, 'payments'), {
        registrationId,
        userId: user.id,
        amount,
        currency: 'INR',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create Razorpay order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          paymentId: paymentRef.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const { orderId } = await response.json();

      // Update payment document with order ID
      await updateDoc(paymentRef, {
        razorpayOrderId: orderId,
        updatedAt: serverTimestamp(),
      });

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      const scriptPromise = new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      });

      document.body.appendChild(script);
      await scriptPromise;

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Aarohan',
        description: 'Event Registration Payment',
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        handler: async function (response: any) {
          try {
            await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: paymentRef.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
          } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              // Update payment status to failed if modal is dismissed
              await updateDoc(paymentRef, {
                status: 'failed',
                updatedAt: serverTimestamp(),
              });
            } catch (error) {
              console.error('Error updating payment status:', error);
            }
          },
          escape: false,
          confirm_close: true,
        },
        theme: {
          color: '#0070f3',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async function (response: any) {
        try {
          await updateDoc(paymentRef, {
            status: 'failed',
            error: response.error.description,
            updatedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Error updating payment status:', error);
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const verifyPayment = useCallback(async (paymentId: string, orderId: string, signature: string) => {
    try {
      setLoading(true);

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          razorpaySignature: signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    initiatePayment,
    verifyPayment,
  };
} 