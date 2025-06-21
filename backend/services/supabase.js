// services/supabase.js

require('dotenv').config(); // 🔴 Needed to load .env variables

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = supabase;
