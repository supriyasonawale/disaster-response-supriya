const { verifyDisasterImage } = require('../services/verifyImageService');
const { getFromCache, setCache } = require('../services/cacheService');

async function verifyImage(req, res) {
  const { id } = req.params;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'Missing image_url' });
  }

  const cacheKey = `verify_image:${image_url}`;
  
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });

    const result = await verifyDisasterImage(image_url);

    await setCache(cacheKey, result);
    req.socketService?.emit(`disaster-${id}`, {
      type: 'image_verified',
      payload: result
    });

    res.json({ cached: false, ...result });
  } catch (error) {
    console.error('Verification error:', error.message);
    res.status(500).json({ error: 'Image verification failed' });
  }
}

module.exports = { verifyImage };
