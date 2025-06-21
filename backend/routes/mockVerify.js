const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'Missing image_url' });
  }

  const statuses = ['verified', 'suspicious', 'unverified'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  const mockResponse = {
    status: randomStatus,
    confidence: Math.floor(Math.random() * 50) + 50,
    reasons: [`Mock analysis: Looks ${randomStatus}`],
    image_url,
    cached: false
  };

  console.log('✅ [MOCK] Image verification:', mockResponse);
  res.json(mockResponse);
});

module.exports = router;
