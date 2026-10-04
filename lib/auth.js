import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabase, db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  if (isSupabaseConfigured) {
    try {
      // Validate session user against Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;

      // Retrieve profile details for roles
      const profile = await db.users.findById(user.id);
      return {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'Customer',
        role: profile?.role || 'customer'
      };
    } catch (err) {
      console.error("Supabase user verification error:", err);
      return null;
    }
  } else {
    // JWT Mode fallback
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role || 'customer'
      };
    } catch (err) {
      return null;
    }
  }
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}
