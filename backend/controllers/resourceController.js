const supabase = require('../services/supabase');

async function getNearbyResources(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const dist = parseFloat(req.query.radius || '10') * 1000; // default 10 km

    // Validate input
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Latitude and longitude are required." });
    }

    // Call Supabase RPC
    const { data, error } = await supabase.rpc('nearby_resources', {
      lat,
      lon,
      dist
    });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Nearby Resource Error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getNearbyResources };
