import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('DEBUG env keys disponibles:', Object.keys(import.meta.env));
console.log('DEBUG VITE_SUPABASE_URL:', JSON.stringify(supabaseUrl));

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
