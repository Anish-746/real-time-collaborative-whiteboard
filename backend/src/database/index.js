import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

// Create Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey // Use service role for backend operations
);

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      throw error;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

export { supabase };
export default supabase;