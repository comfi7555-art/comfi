import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET all products
export async function GET(request) {
  try {
    const products = await db.products.find({});
    return NextResponse.json(products);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error retrieving products' }, { status: 500 });
  }
}

// POST create product (Admin Only)
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access only' }, { status: 403 });
    }

    const { name, size, length, packCount, price, stock, description, features } = await request.json();

    if (!name || !size || !price || !stock) {
      return NextResponse.json({ message: 'Missing product parameters' }, { status: 400 });
    }

    const newProduct = await db.products.create({
      name,
      size,
      length: length || '',
      packCount: Number(packCount) || 10,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
      features: features || [],
      reviews: []
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Error creating product' }, { status: 500 });
  }
}
