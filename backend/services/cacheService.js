const supabase = require('../supabaseClient');
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getFromCache(key) {
  const { data, error } = await supabase
    .from('cache')
    .select('value')
    .eq('key', key)
    .gt('expires_at', new Date().toISOString())
    .single();

  return data ? data.value : null;
}

async function setCache(key, value) {
  const expiresAt = new Date(Date.now() + CACHE_TTL);
  
  await supabase.from('cache').upsert({
    key,
    value,
    expires_at: expiresAt.toISOString()
  });
}

module.exports = { getFromCache, setCache };