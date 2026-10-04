import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

const keySecret = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return NextResponse.json({ message: 'Missing signature inputs' }, { status: 400 });
    }

    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", keySecret)
      .update(text)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      const order = await db.orders.findById(dbOrderId);
      if (!order) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }

      await db.orders.findByIdAndUpdate(dbOrderId, {
        paymentStatus: 'Paid',
        razorpayPaymentId: razorpay_payment_id
      });

      // Deduct inventory levels
      for (const item of order.items) {
        const product = await db.products.findById(item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await db.products.findByIdAndUpdate(item.id, { stock: newStock });
        }
      }

      return NextResponse.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Signature verification mismatch' }, { status: 400 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
