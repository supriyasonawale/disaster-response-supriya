const { get: getFromCache, set: setCache } = require('../services/cacheService');

async function getSocialMediaReports(req, res) {
  try {
    const { id } = req.params;
    const cacheKey = `social_media:${id}`;
    
    // Check cache
    const cached = await getFromCache(cacheKey);
    if (cached) return res.json(cached);

    // Bluesky not publicly searchable — simulate failure
    throw new Error("Bluesky public post search not supported");

  } catch (error) {
    console.log('⚠️ Falling back to mock social data');

    // Mock fallback
    const mockData = [
      { user: 'citizen1', content: 'Need water downtown! #flood', timestamp: new Date().toISOString() },
      { user: 'relief_team', content: 'Shelter setup at Main St', timestamp: new Date().toISOString() }
    ];

    // Cache and emit
    await setCache(`social_media:${req.params.id}`, mockData, 1800);
    
    // Optional: broadcast to clients if socket attached
    if (req.socketService && req.socketService.emitSocialUpdate) {
      req.socketService.emitSocialUpdate(req.params.id, mockData);
    }

    res.json(mockData);
  }
}

module.exports = { getSocialMediaReports };
