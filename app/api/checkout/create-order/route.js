import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;
if (keyId && keySecret && keyId !== 'YOUR_KEY_ID' && keySecret !== 'YOUR_KEY_SECRET') {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.error("Razorpay setup failed:", err);
  }
}

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { amount, items, shippingAddress, customerName, customerEmail } = await request.json();
    if (!amount || !items || !shippingAddress) {
      return NextResponse.json({ message: 'Missing order parameters' }, { status: 400 });
    }

    const internalOrderId = 'ord_' + Math.random().toString(36).substr(2, 9);

    if (razorpayInstance) {
      // 1. Razorpay Mode
      const options = {
        amount: Math.round(amount * 100), // in paise
        currency: "INR",
        receipt: internalOrderId
      };

      const razorpayOrder = await razorpayInstance.orders.create(options);

      const order = await db.orders.create({
        userId: user.id,
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        items,
        totalAmount: amount,
        shippingAddress,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        razorpayOrderId: razorpayOrder.id
      });

      return NextResponse.json({
        success: true,
        isMockPayment: false,
        keyId,
        orderId: razorpayOrder.id,
        amount: options.amount,
        currency: "INR",
        dbOrderId: order.id
      });

    } else {
      // 2. Mock Mode
      const order = await db.orders.create({
        userId: user.id,
        customerName: customerName || user.name,
        customerEmail: customerEmail || user.email,
        items,
        totalAmount: amount,
        shippingAddress,
        paymentStatus: 'Pending',
        orderStatus: 'Processing',
        razorpayOrderId: `mock_rzp_${Math.random().toString(36).substr(2, 9)}`
      });

      return NextResponse.json({
        success: true,
        isMockPayment: true,
        orderId: order.razorpayOrderId,
        amount: amount,
        currency: "INR",
        dbOrderId: order.id
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error initiating order creation' }, { status: 500 });
  }
}
