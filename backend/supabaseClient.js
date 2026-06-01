const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // Usar el Service Role Key para operaciones del backend sin RLS

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Falta configurar SUPABASE_URL y SUPABASE_SERVICE_KEY en el archivo .env');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseKey || 'placeholder'
);

module.exports = supabase;
