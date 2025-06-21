const axios = require('axios');
const cheerio = require('cheerio');
const { getFromCache, setCache } = require('./cacheService');

async function fetchFEMAUpdates() {
  const cacheKey = 'official_updates:fema';
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get('https://www.fema.gov/press-releases');
    const $ = cheerio.load(response.data);
    const updates = [];
    
    $('.views-row').each((i, el) => {
      updates.push({
        title: $(el).find('h3').text().trim(),
        date: $(el).find('.date').text().trim(),
        url: `https://www.fema.gov${$(el).find('a').attr('href')}`
      });
    });

    await setCache(cacheKey, updates);
    return updates.slice(0, 5); // Return latest 5
  } catch (error) {
    return [{title: 'Official updates currently unavailable', date: '', url: ''}];
  }
}

module.exports = { fetchFEMAUpdates };