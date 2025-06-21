const axios = require('axios');
const cheerio = require('cheerio');
const { getFromCache, setCache } = require('../services/cacheService');

async function getOfficialUpdates(req, res) {
  const { id } = req.params;
  const cacheKey = `official_updates:${id}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.json(cached);

    // Example: Scrape Red Cross India News page
    const response = await axios.get('https://www.ifrc.org/news');

    const $ = cheerio.load(response.data);
    const updates = [];

    $('.views-row').each((_, el) => {
      const title = $(el).find('.card__title a').text().trim();
      const link = 'https://www.ifrc.org' + $(el).find('.card__title a').attr('href');
      const date = $(el).find('.card__date').text().trim();
      if (title && link) {
        updates.push({ title, link, date });
      }
    });

    // Cache for 1 hour
    await setCache(cacheKey, updates);

    req.socketService.emit(`disaster-${id}`, {
      type: 'official_updates',
      data: updates
    });

    res.json(updates);
  } catch (err) {
    console.error("Scraping failed:", err.message);
    res.status(500).json({ error: "Unable to fetch official updates" });
  }
}

module.exports = { getOfficialUpdates };
