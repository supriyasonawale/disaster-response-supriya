// routes/resources.js
const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/initSupabase');
const authMiddleware = require('../middleware/auth');

// GET /resources?lat=..&lon=..&radius=..
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { lat, lon, radius = 10000 } = req.query; // Default 10km

    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat and lon parameters are required' });
    }

    const { data: resources, error } = await supabase.rpc('nearby_resources', {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      rad: parseInt(radius)
    });

    if (error) throw error;

    res.json({
  coordinates: { lat, lon },
  radius_km: radius / 1000,
  count: resources.length,
  resources: resources.map(r => ({
    id: r.id,
    name: r.name,
    type: r.type,
    location_name: r.location_name,
    created_at: r.created_at
  }))
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
