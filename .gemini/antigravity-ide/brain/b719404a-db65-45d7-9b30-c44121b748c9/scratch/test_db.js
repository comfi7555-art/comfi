const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../../../../../Desktop/Comfi/.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

// Next, let's load lib/db.js
// Since lib/db.js uses ES modules (import/export), we can't 'require' it directly in Node if it doesn't support ESM scripts.
// But we can check if it supports require or if we can run a dynamic check.
// Let's import the db model logic directly in this script to execute it.
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

console.log("Supabase Configured:", isSupabaseConfigured);
console.log("Supabase URL:", supabaseUrl);

const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

async function testDatabase() {
  const email = "comfi7555@gmail.com";
  const otpCode = "999999";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  if (!isSupabaseConfigured) {
    console.log("Supabase is NOT configured. Fallback JSON DB mode would be used.");
    return;
  }

  try {
    console.log("🧹 Testing Supabase Delete...");
    let builder = supabase.from('otps').delete().eq('email', email);
    const { data: delData, error: delError } = await builder;
    if (delError) throw delError;
    console.log("✓ Delete operation complete.");

    console.log("✍️ Testing Supabase Insert...");
    const newOtp = {
      id: 'otp_' + Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      email,
      code: otpCode,
      expiresAt
    };
    const { data: insData, error: insError } = await supabase.from('otps').insert([newOtp]).select().single();
    if (insError) throw insError;
    console.log("✓ Insert operation complete:", insData);
  } catch (err) {
    console.error("❌ SUPABASE OPERATION FAILED:", err);
  }
}

testDatabase();
