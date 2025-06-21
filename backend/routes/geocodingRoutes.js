// routes/geocodingRoutes.js
const express = require('express');
const router = express.Router();
const { extractLocationAndGeocode } = require('../services/locationService');

// POST /api/geocode
router.post('/', async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Missing description' });
    }

    const result = await extractLocationAndGeocode(description);
    res.json(result);
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// GET /api/geocode/test (for dev testing)
router.get('/test', async (req, res) => {
  try {
    const result = await extractLocationAndGeocode("Flood in Central Park, New York");
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
