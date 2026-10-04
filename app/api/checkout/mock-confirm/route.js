import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { dbOrderId, razorpay_payment_id, status } = await request.json();

    if (!dbOrderId || !status) {
      return NextResponse.json({ message: 'Missing parameters' }, { status: 400 });
    }

    const order = await db.orders.findById(dbOrderId);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (status === 'success') {
      await db.orders.findByIdAndUpdate(dbOrderId, {
        paymentStatus: 'Paid',
        razorpayPaymentId: razorpay_payment_id || `mock_pay_${Math.random().toString(36).substr(2, 9)}`
      });

      // Deduct inventory levels
      for (const item of order.items) {
        const product = await db.products.findById(item.id);
        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await db.products.findByIdAndUpdate(item.id, { stock: newStock });
        }
      }

      return NextResponse.json({ success: true, message: 'Mock payment approved' });
    } else {
      await db.orders.findByIdAndUpdate(dbOrderId, {
        paymentStatus: 'Failed'
      });
      return NextResponse.json({ success: false, message: 'Mock payment declined' });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
