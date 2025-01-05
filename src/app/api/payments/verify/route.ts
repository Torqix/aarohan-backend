import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const {
      paymentId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = await request.json();

    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'All payment details are required' },
        { status: 400 }
      );
    }

    // Verify signature
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update payment and registration status
    await runTransaction(db, async (transaction) => {
      // Get payment document
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentDoc = await transaction.get(paymentRef);

      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }

      const paymentData = paymentDoc.data();

      // Get registration document
      const registrationRef = doc(db, 'registrations', paymentData.registrationId);
      const registrationDoc = await transaction.get(registrationRef);

      if (!registrationDoc.exists()) {
        throw new Error('Registration not found');
      }

      // Update payment document
      transaction.update(paymentRef, {
        status: 'completed',
        razorpayPaymentId,
        updatedAt: serverTimestamp(),
      });

      // Update registration document
      transaction.update(registrationRef, {
        paymentStatus: 'completed',
        paymentId: razorpayPaymentId,
        updatedAt: serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
} 