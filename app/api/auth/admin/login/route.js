import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabase, db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Missing login fields' }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      // 1. Supabase Mode Login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
      }

      // Check role profile to ensure admin status
      const profile = await db.users.findById(data.user.id);
      if (!profile || profile.role !== 'admin') {
        // Sign out user immediately to clear active session
        await supabase.auth.signOut();
        return NextResponse.json({ message: 'Access denied: Admin credentials required' }, { status: 403 });
      }

      return NextResponse.json({
        token: data.session.access_token,
        user: { id: data.user.id, name: profile.name, email: data.user.email, role: 'admin' }
      });

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

      // Ensure Carol Admin exists
      const carolExists = await db.users.findOne({ email: 'carolpillai02@gmail.com' });
      if (!carolExists) {
        await db.users.create({
          email: 'carolpillai02@gmail.com',
          password: bcrypt.hashSync('Test123', 10),
          name: 'Carol Pillai',
          role: 'admin'
        });
      }

      const user = await db.users.findOne({ email });
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied: Admin credentials required' }, { status: 403 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return NextResponse.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
