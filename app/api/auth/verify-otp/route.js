import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function POST(request) {
  try {
    const { email, otp, name, dob, phone } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and verification code are required.' }, { status: 400 });
    }

    // 1. Retrieve the verification code from database
    const otpRecord = await db.otps.findOne({ email, code: otp });

    if (!otpRecord) {
      return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
    }

    // 2. Verify code expiry
    const isExpired = new Date() > new Date(otpRecord.expiresAt);
    if (isExpired) {
      await db.otps.deleteMany({ email }); // clear expired OTPs
      return NextResponse.json({ message: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // 3. Clear code after verification to prevent reuse
    await db.otps.deleteMany({ email });

    // 4. Authenticate User Profile
    let user = await db.users.findOne({ email });

    if (!user) {
      // Create profile for new signup
      user = await db.users.create({
        name: name?.trim() || 'Valued Customer',
        email: email.trim().toLowerCase(),
        dob: dob || '',
        phone: phone || '',
        role: 'customer'
      });
    }

    // 5. Sign JWT Login Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Generate the OLIPOP-themed HTML Welcome email body
    // Uses warm cream canvas background, forest-teal anchors, and wine-red title highlights.
    const welcomeHtml = `
      <div style="background-color: #fdf7e7; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #3a3a3a; text-align: center; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e3e3e3;">
        <div style="background-color: #d0385c; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fdf7e7; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: -0.02em; text-transform: uppercase;">COMFI</h1>
        </div>
        <h2 style="color: #d0385c; font-family: Georgia, serif; font-size: 24px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em;">HEY ${user.name.toUpperCase()}, YOU LOGGED IN!</h2>
        <p style="font-size: 16px; line-height: 1.6; font-weight: normal; margin-bottom: 28px; max-width: 480px; margin-left: auto; margin-right: auto; color: #3a3a3a;">
          Welcome back to COMFI! Your custom period care profile has been authenticated. You can now save favorites, build custom pad mixes, and complete orders.
        </p>
        <a href="https://comfi-store.vercel.app/shop" style="background-color: #d0385c; color: #ffffff; padding: 14px 28px; border-radius: 50px; font-weight: bold; font-size: 12px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; display: inline-block; margin-bottom: 30px; border: 1px solid transparent; box-shadow: 0 4px 12px rgba(20,67,61,0.15);">
          Start Shopping
        </a>
        <p style="font-size: 14px; line-height: 1.6; margin-bottom: 30px; color: #3a3a3a;">
          We're thrilled to have you with us. Enjoy rash-free, eco-safe, ultra-thin protection designed to stay in harmony with your body.
        </p>
        <hr style="border: 0; border-top: 1px solid #e3e3e3; margin: 40px 0 20px 0;" />
        <p style="font-size: 11px; color: rgba(58,58,58,0.4); text-transform: uppercase; letter-spacing: 0.15em;">
          COMFI Care &bull; Ultra Thin Protection
        </p>
      </div>
    `;

    // 7. Dispatch Welcome Email asynchronously
    sendEmail({
      to: user.email,
      subject: `Hey ${user.name}, you logged in! Happy shopping ⚡`,
      html: welcomeHtml
    }).catch(err => console.error('Failed to dispatch welcome email in background:', err));

    return NextResponse.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        dob: user.dob || '',
        phone: user.phone || ''
      }
    });

  } catch (err) {
    require('fs').appendFileSync(require('path').join(process.cwd(), 'error_log.txt'), '\\n--- VERIFY-OTP ERROR ---\\n' + (err.stack || err.toString()) + '\\n');
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
