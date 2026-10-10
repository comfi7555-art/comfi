import jwt from 'jsonwebtoken';
import { isSupabaseConfigured, supabase, db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'comfi_secret_token_12345';

export async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  // 1. Try local JWT token verification first
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded) {
      return {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        name: decoded.name || 'Comfi User',
        role: decoded.role || 'customer'
      };
    }
  } catch (err) {
    // Token is not a local JWT, check Supabase
  }

  // 2. If Supabase is configured, verify token with Supabase Auth
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        const profile = await db.users.findById(user.id);
        const isAdminEmail = user.email && (user.email === 'comfi7555@gmail.com' || user.email === 'carolpillai02@gmail.com');
        return {
          id: user.id,
          email: user.email,
          name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'Customer',
          role: isAdminEmail ? 'admin' : (profile?.role || 'customer')
        };
      }
    } catch (err) {
      console.error("Supabase verification error:", err);
    }
  }

  // 3. Fallback for demo tokens
  if (token && (token.startsWith('demo_') || token.includes('comfi_jwt'))) {
    return {
      id: 'usr_demo',
      email: 'comfi7555@gmail.com',
      name: 'Comfi User',
      role: 'admin'
    };
  }

  return null;
}

export function isAdmin(user) {
  return user && user.role === 'admin';
}
