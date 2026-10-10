import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabase, db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and security password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ADMIN_EMAILS = [
      'comfi7555@gmail.com', 
      'carolpillai02@gmail.com', 
      'pillaicarolcs242549@gmail.com', 
      'admin@comfi.com'
    ];
    const isAdminEmail = ADMIN_EMAILS.includes(normalizedEmail) || normalizedEmail.includes('carol') || normalizedEmail.includes('comfi7555');

    const validAdminPasswords = ['ComfiAdmin123!', 'Test123', 'comfi123', 'Comfi123!', 'admin123', 'carol123', 'comfi7555'];
    const isMasterPassword = validAdminPasswords.includes(password);

    // 1. Direct Admin Master Password Bypass for authorized admin emails
    if (isAdminEmail && isMasterPassword) {
      const token = jwt.sign(
        { userId: 'usr_admin_01', email: normalizedEmail, role: 'admin', name: 'Carol Pillai (Super Admin)' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        token,
        user: { id: 'usr_admin_01', name: 'Carol Pillai (Super Admin)', email: normalizedEmail, role: 'admin' }
      });
    }

    // 2. Supabase Mode Login
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

        if (!error && data?.session) {
          const profile = await db.users.findById(data.user.id);
          const isUserAdmin = isAdminEmail || profile?.role === 'admin';
          if (!isUserAdmin) {
            await supabase.auth.signOut();
            return NextResponse.json({ message: 'Access denied: Admin authorization required' }, { status: 403 });
          }

          return NextResponse.json({
            token: data.session.access_token,
            user: { id: data.user.id, name: profile?.name || data.user.user_metadata?.full_name || 'Admin User', email: data.user.email, role: 'admin' }
          });
        }
      } catch (sbErr) {
        console.warn("Supabase admin login fallback to local check:", sbErr);
      }
    }

    // 3. Local JSON DB / Hash Password Verification
    let user = await db.users.findOne({ email: normalizedEmail });
    if (!user && isAdminEmail) {
      user = {
        id: 'usr_admin_01',
        name: 'Carol Pillai (Super Admin)',
        email: normalizedEmail,
        role: 'admin'
      };
    }

    if (!user || (user.role !== 'admin' && !isAdminEmail)) {
      return NextResponse.json({ message: 'Access denied: Admin credentials required' }, { status: 403 });
    }

    let isMatch = isMasterPassword;
    if (!isMatch && user.password) {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false) || user.password === password;
    }

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid admin password. Try ComfiAdmin123!' }, { status: 400 });
    }

    const token = jwt.sign(
      { userId: user.id || 'usr_admin_01', email: user.email, role: 'admin', name: user.name || 'Admin User' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      token,
      user: { id: user.id || 'usr_admin_01', name: user.name || 'Carol Pillai (Admin)', email: user.email, role: 'admin' }
    });

  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
