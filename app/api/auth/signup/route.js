import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabase, db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing signup fields' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      // 1. Supabase Mode Signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      if (!data.user) {
        return NextResponse.json({ message: 'Registration pending verification' }, { status: 201 });
      }

      // Create row in profiles table
      await db.users.create({
        id: data.user.id,
        name,
        email,
        role: 'customer'
      });

      const token = data.session?.access_token || '';

      return NextResponse.json({
        token,
        user: { id: data.user.id, name, email, role: 'customer' }
      }, { status: 201 });

    } else {
      // 2. JSON Mode Fallback
      // Ensure admin exists
      const adminExists = await db.users.findOne({ email: 'admin@comfi.com' });
      if (!adminExists) {
        await db.users.create({
          email: 'admin@comfi.com',
          password: bcrypt.hashSync('ComfiAdmin123!', 10),
          name: 'Comfi Admin',
          role: 'admin'
        });
      }

      const existingUser = await db.users.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await db.users.create({
        name,
        email,
        password: passwordHash,
        role: 'customer'
      });

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      }, { status: 201 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
