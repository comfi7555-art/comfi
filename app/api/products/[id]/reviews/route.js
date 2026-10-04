import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json({ message: 'Missing review parameters' }, { status: 400 });
    }

    const product = await db.products.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const review = {
      user: user.name || 'Anonymous',
      rating: Number(rating),
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    const updatedReviews = [...(product.reviews || []), review];
    const updated = await db.products.findByIdAndUpdate(id, { reviews: updatedReviews });

    return NextResponse.json(updated, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error saving review' }, { status: 500 });
  }
}
