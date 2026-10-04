import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET single product
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await db.products.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error retrieving product' }, { status: 500 });
  }
}

// PUT update product (Admin Only)
export async function PUT(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const product = await db.products.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const updated = await db.products.findByIdAndUpdate(id, body);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error updating product' }, { status: 500 });
  }
}

// DELETE product (Admin Only)
export async function DELETE(request, { params }) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const { id } = await params;
    const product = await db.products.findById(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const deleted = await db.products.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Product successfully deleted', deleted });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
  }
}
