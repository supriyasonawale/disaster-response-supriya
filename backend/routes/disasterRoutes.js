const express = require('express');
const { supabase } = require('../utils/initSupabase');

module.exports = (io) => {
  const router = express.Router();

  // 🔁 GET /api/disasters - Fetch all disasters
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('disasters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // ✳️ POST /api/disasters - Create new disaster
  router.post('/', async (req, res) => {
    try {
      const { title, location_name, lat, lon, description, tags, owner_id } = req.body;

      // ✅ Validate required fields
      if (!title || !location_name || !lat || !lon) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: title, location_name, lat, lon are mandatory.'
        });
      }

      // ✅ Format as PostGIS point
      const point = `SRID=4326;POINT(${lon} ${lat})`;

      // ✅ Insert into Supabase
      const { data, error } = await supabase
        .from('disasters')
        .insert([{
  title,
  location_name,
  location: point,
  description,
  tags: Array.isArray(tags) ? tags : [tags],
  owner_id: owner_id || 'netrunnerX',
  image_url,
  audit_trail: [{
    action: 'create',
    user_id: owner_id || 'system',
    timestamp: new Date().toISOString()
  }]
}])

        .select('*');

      if (error) throw error;

      const createdDisaster = data[0];

      // ✅ Emit real-time event
      io.emit('disaster_created', createdDisaster);

      // ✅ Respond with structured JSON
      res.status(201).json({
        success: true,
        message: 'Disaster created successfully',
        data: createdDisaster
      });

    } catch (error) {
      console.error('❌ Create disaster error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // 💬 GET /api/disasters/:id/social-media - Mock social media posts
  router.get('/:id/social-media', async (req, res) => {
    const { id } = req.params;

    // You can also use Supabase to fetch disaster tags and customize posts
    // For now, use static mock posts
    const mockPosts = [
      {
        user: 'citizen_1',
        post: '⚠️ Need help near Central Park! #flood #emergency',
        timestamp: new Date().toISOString()
      },
      {
        user: 'rescue_bot',
        post: 'Red Cross team dispatched. Stay safe! #rescue',
        timestamp: new Date().toISOString()
      },
      {
        user: 'local_news',
        post: 'Major flooding reported. Stay indoors. #disasterUpdate',
        timestamp: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: mockPosts
    });
  });

  return router;
};
