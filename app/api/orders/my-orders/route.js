import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await db.orders.find({ userId: user.id });
    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error retrieving order history' }, { status: 500 });
  }
}
