// utils/cache.js
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

module.exports = {
  get: async (key) => {
    try {
      const { data } = await supabase
        .from('cache')
        .select('value')
        .eq('key', key)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      return data?.value;
    } catch (error) {
      console.error('Cache get error:', error.message);
      return null;
    }
  },
  
  set: async (key, value, ttl = 3600) => {
    try {
      const expires_at = new Date(Date.now() + ttl * 1000).toISOString();
      await supabase
        .from('cache')
        .upsert({ key, value, expires_at });
    } catch (error) {
      console.error('Cache set error:', error.message);
    }
  }
};