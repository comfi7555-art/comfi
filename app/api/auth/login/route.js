import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();
    
    // Check if user exists
    const user = await db.users.findOne({ email: emailLower });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify Password
    const hashedAttempt = hashPassword(password);
    if (user.passwordHash !== hashedAttempt) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // Check for Two-Factor Authentication
    if (user.isTwoFactorEnabled) {
      // Generate a 6-digit OTP for 2FA
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      await db.otps.create({
        email: emailLower,
        code: otpCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

      const emailHtml = `
        <div style="background-color: #fdf7e7; padding: 40px; font-family: sans-serif; text-align: center; border-radius: 16px;">
          <h2 style="color: #d0385c; font-weight: 800;">TWO-FACTOR AUTHENTICATION</h2>
          <p style="color: #3a3a3a; font-size: 16px; margin-bottom: 24px;">Your 2FA security code is:</p>
          <div style="background-color: #fae3e5; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #d0385c; border-radius: 12px; margin-bottom: 24px;">
            ${otpCode}
          </div>
          <p style="color: #3a3a3a; font-size: 12px;">This code will expire in 10 minutes. If you did not request this, please change your password immediately.</p>
        </div>
      `;

      sendEmail({
        to: emailLower,
        subject: 'Your COMFI 2FA Security Code',
        html: emailHtml
      }).catch(err => console.error('Failed to send 2FA email:', err));

      return NextResponse.json({
        success: true,
        requires2FA: true,
        message: '2FA code dispatched to your email.'
      });
    }

    // No 2FA, log them in directly
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
