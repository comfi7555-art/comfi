import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const orders = await db.orders.find({});
    return NextResponse.json(orders);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error retrieving orders' }, { status: 500 });
  }
}
