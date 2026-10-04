import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    // 1. Clean up any existing OTPs for this email address to avoid clutter
    await db.otps.deleteMany({ email });

    // 2. Generate a random 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Save the verification code with a 5-minute expiration window
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    await db.otps.create({
      email,
      code: otpCode,
      expiresAt
    });

    // 4. Generate the OLIPOP-themed HTML email body
    const emailHtml = `
      <div style="background-color: #fdf7e7; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #3a3a3a; text-align: center; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e3e3e3;">
        <div style="background-color: #d0385c; padding: 20px; border-radius: 12px 12px 0 0; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #fdf7e7; font-family: Georgia, serif; font-size: 28px; margin: 0; letter-spacing: -0.02em; text-transform: uppercase;">COMFI</h1>
        </div>
        <p style="font-size: 16px; line-height: 1.6; font-weight: normal; margin-bottom: 20px; color: #3a3a3a;">
          Hello${name ? ` ${name}` : ''}! Let's verify your email address to access your custom period care profile.
        </p>
        <div style="background-color: #fae3e5; padding: 24px; border-radius: 12px; display: inline-block; margin: 20px auto; min-width: 220px; border: 1px solid rgba(20,67,61,0.15);">
          <span style="font-size: 10px; font-weight: bold; letter-spacing: 0.2em; color: #7e0022; text-transform: uppercase; display: block; margin-bottom: 8px;">YOUR VERIFICATION CODE</span>
          <span style="font-size: 36px; font-weight: 900; letter-spacing: 0.15em; color: #d0385c; font-family: Courier, monospace;">${otpCode}</span>
        </div>
        <p style="font-size: 13px; color: rgba(58,58,58,0.6); line-height: 1.5; margin-top: 20px;">
          This verification code is valid for 5 minutes. If you did not request this, please disregard this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #e3e3e3; margin: 40px 0 20px 0;" />
        <p style="font-size: 11px; color: rgba(58,58,58,0.4); text-transform: uppercase; letter-spacing: 0.15em;">
          COMFI Care &bull; Ultra Thin Protection
        </p>
      </div>
    `;

    // 5. Dispatch email
    const emailResult = await sendEmail({
      to: email,
      subject: `COMFI Verification Code: ${otpCode}`,
      html: emailHtml
    });

    if (emailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent successfully.', 
        simulated: !!emailResult.simulated 
      });
    } else {
      return NextResponse.json({ 
        message: 'Failed to send verification email.', 
        error: emailResult.error 
      }, { status: 500 });
    }

  } catch (err) {
    require('fs').appendFileSync(require('path').join(process.cwd(), 'error_log.txt'), '\\n--- SEND-OTP ERROR ---\\n' + (err.stack || err.toString()) + '\\n');
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
