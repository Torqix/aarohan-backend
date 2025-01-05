import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, paymentId } = await request.json();

    if (!amount || !paymentId) {
      return NextResponse.json(
        { error: 'Amount and payment ID are required' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: paymentId,
    });

    // Update payment document with order ID
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      razorpayOrderId: order.id,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
} 