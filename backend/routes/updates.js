const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Predefined official sources
const OFFICIAL_SOURCES = [
  {
    name: 'FEMA',
    url: 'https://www.fema.gov/press-releases',
    selector: '.fema-gem__press-release',
    extract: ($, el) => ({
      title: $(el).find('.fema-gem__press-release__title').text().trim(),
      link: `https://www.fema.gov${$(el).find('a').attr('href')}`,
      date: $(el).find('.fema-gem__press-release__date').text().trim(),
      source: 'FEMA'
    })
  },
  {
    name: 'Red Cross',
    url: 'https://www.redcross.org/about-us/news-and-events/news',
    selector: '.list-item',
    extract: ($, el) => ({
      title: $(el).find('.title').text().trim(),
      link: `https://www.redcross.org${$(el).find('a').attr('href')}`,
      date: $(el).find('.date').text().trim(),
      source: 'Red Cross'
    })
  }
];

// Cache TTL (1 hour)
const CACHE_TTL = 60 * 60 * 1000;

// GET /disasters/:id/official-updates
router.get('/:id/official-updates', async (req, res) => {
  try {
    const disasterId = req.params.id;

    const { data: disaster, error } = await supabase
      .from('disasters')
      .select('id, tags, location_name')
      .eq('id', disasterId)
      .single();

    if (error) throw error;
    if (!disaster) return res.status(404).json({ error: 'Disaster not found' });

    const cacheKey = `official-updates-${disasterId}`;
    const cachedData = await checkCache(cacheKey);
    if (cachedData) return res.json(cachedData);

    // Scrape and filter
    const scrapedData = [];
    for (const source of OFFICIAL_SOURCES) {
      try {
        const data = await scrapeSource(source, disaster);
        scrapedData.push(...data);
      } catch (err) {
        console.error(`Scraping failed for ${source.name}:`, err.message);
      }
    }

    await setCache(cacheKey, scrapedData);
    res.json(scrapedData);
  } catch (error) {
    console.error('Official updates error:', error.message);
    res.status(500).json({ error: 'Failed to fetch official updates' });
  }
});

// Helper: Scrape and match relevant articles
async function scrapeSource(source, disaster) {
  const response = await axios.get(source.url);
  const $ = cheerio.load(response.data);
  const results = [];

  const keywords = [...(disaster.tags || []), ...disaster.location_name.replace(/[,]/g, '').split(' ')];
  console.log(`\n🔎 Source: ${source.name}`);
  console.log(`🧠 Keywords:`, keywords);

  $(source.selector).each((i, el) => {
    const item = source.extract($, el);
    const text = `${item.title} ${item.source}`.toLowerCase();
    const isRelevant = keywords.some(keyword =>
      text.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(text)
    );

    if (isRelevant) {
      console.log(`✅ Matched: ${item.title}`);
      results.push({
        ...item,
        disaster_id: disaster.id,
        relevance_score: calculateRelevance(item, disaster)
      });
    } else {
      console.log(`❌ Skipped: ${item.title}`);
    }
  });

  return results.slice(0, 5); // Return top 5 relevant items
}

// Relevance scoring logic
function calculateRelevance(item, disaster) {
  let score = 0;
  const title = item.title.toLowerCase();
  (disaster.tags || []).forEach(tag => {
    if (title.includes(tag.toLowerCase())) score += 10;
  });
  if (title.includes(disaster.location_name.toLowerCase())) score += 15;
  return score;
}

// Supabase cache check
async function checkCache(key) {
  const { data, error } = await supabase
    .from('cache')
    .select('value')
    .eq('key', key)
    .gt('expires_at', new Date().toISOString())
    .single();
  return data ? data.value : null;
}

// Supabase cache setter
async function setCache(key, value) {
  const expiresAt = new Date(Date.now() + CACHE_TTL).toISOString();
  await supabase.from('cache').upsert({
    key,
    value,
    expires_at: expiresAt
  });
}

module.exports = router;
