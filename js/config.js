// Backend configuration.
//
// Preferred: leave both values empty and set SUPABASE_URL and
// SUPABASE_ANON_KEY as environment variables in Vercel. The serverless
// function in api/config.js hands them to the browser at load time.
//
// Alternative: paste the values here. The anon key is safe to expose; row
// level security in supabase/schema.sql is what protects the data.
//
// With neither, the app runs in local mode: everything stays on one phone.
export const CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
};
