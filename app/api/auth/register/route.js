import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

export async function POST(request) {
  try {
    const { email, password, name, dob, phone } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    
    // Check if user already exists
    const existingUser = await db.users.findOne({ email: emailLower });
    if (existingUser) {
      return NextResponse.json({ message: 'An account with this email already exists.' }, { status: 400 });
    }

    // Create new user
    const user = await db.users.create({
      name: name?.trim() || 'Valued Customer',
      email: emailLower,
      passwordHash: hashPassword(password),
      dob: dob || '',
      phone: phone || '',
      role: 'customer',
      avatarUrl: null,
      isTwoFactorEnabled: false,
      twoFactorSecret: null
    });

    // Sign JWT Login Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatarUrl: user.avatarUrl,
        isTwoFactorEnabled: user.isTwoFactorEnabled
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
