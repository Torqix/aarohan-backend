import { loadScript } from '@/lib/utils';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function initializeRazorpay(): Promise<boolean> {
  const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  return res;
}

export function createRazorpayOrder(options: RazorpayOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,
      handler: (response: RazorpayResponse) => {
        options.handler(response);
        resolve();
      },
      modal: {
        ...options.modal,
        ondismiss: () => {
          options.modal?.ondismiss?.();
          reject(new Error('Payment cancelled'));
        },
      },
    });

    rzp.open();
  });
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
} 