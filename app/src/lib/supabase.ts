import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the provided credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://louyujlgirjsslwvqgpz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvdXl1amxnaXJqc3Nsd3ZxZ3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjI2NzcsImV4cCI6MjA1OTg5ODY3N30.qWCANC8IMPB8eXZ1m9MksfBec9Y8Am29EcBRO3i48Mk';

console.log('Initializing Supabase with URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export default supabase;
