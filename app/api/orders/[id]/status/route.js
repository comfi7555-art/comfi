import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const order = await db.orders.findById(id);
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const updated = await db.orders.findByIdAndUpdate(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error updating order' }, { status: 500 });
  }
}
