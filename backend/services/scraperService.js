// services/scraperService.js
const axios = require('axios');
const cheerio = require('cheerio');
const { getFromCache, setCache } = require('./cacheService');

// Example: Scrape Red Cross disaster news (change URL as needed)
const RED_CROSS_URL = 'https://www.redcross.org/about-us/news-and-events/news.html';

async function fetchOfficialUpdates(disasterId) {
  const cacheKey = `official_updates:${disasterId}`;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(RED_CROSS_URL);
    const $ = cheerio.load(response.data);

    // Extract headline and summary from Red Cross news
    const updates = [];

    $('.m-card--content').slice(0, 5).each((i, el) => {
      const title = $(el).find('h3').text().trim();
      const link = 'https://www.redcross.org' + $(el).find('a').attr('href');
      const summary = $(el).find('p').text().trim();
      updates.push({ title, summary, link });
    });

    await setCache(cacheKey, updates, 3600); // Cache for 1 hour
    return updates;
  } catch (err) {
    console.error('Scraping error:', err.message);
    return [];
  }
}

module.exports = { fetchOfficialUpdates };
