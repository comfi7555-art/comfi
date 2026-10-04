import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const profile = await db.users.findById(user.id);
    if (!profile) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      dob: profile.dob || '',
      phone: profile.phone || '',
      avatarUrl: profile.avatarUrl || null,
      isTwoFactorEnabled: profile.isTwoFactorEnabled || false
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import crypto from 'crypto';
const hashPassword = (password) => crypto.createHash('sha256').update(password).digest('hex');

export async function PATCH(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const profile = await db.users.findById(user.id);

    if (!profile) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newProfileData = {};

    // Handle standard fields
    if (updates.name !== undefined) newProfileData.name = updates.name;
    if (updates.phone !== undefined) newProfileData.phone = updates.phone;
    if (updates.dob !== undefined) newProfileData.dob = updates.dob;
    
    // Handle Avatar (Base64)
    if (updates.avatarUrl !== undefined) {
      newProfileData.avatarUrl = updates.avatarUrl;
    }

    // Handle 2FA Toggle
    if (updates.isTwoFactorEnabled !== undefined) {
      newProfileData.isTwoFactorEnabled = updates.isTwoFactorEnabled;
    }

    // Handle Password Change
    if (updates.currentPassword && updates.newPassword) {
      if (profile.passwordHash !== hashPassword(updates.currentPassword)) {
        return NextResponse.json({ message: 'Incorrect current password.' }, { status: 400 });
      }
      newProfileData.passwordHash = hashPassword(updates.newPassword);
    }

    // Save changes
    let updatedProfile;
    if (Object.keys(newProfileData).length > 0) {
      updatedProfile = await db.users.findByIdAndUpdate(user.id, newProfileData);
    }

    return NextResponse.json({ success: true, message: 'Profile updated', user: updatedProfile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
