const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

// GET social media reports for a disaster
router.get('/disasters/:id/social-media', 
  authMiddleware,
  apiLimiter,
  socialMediaController.getSocialMediaReports
);

// Fallback mock endpoint if Twitter API is unavailable
router.get('/mock-social-media', (req, res) => {
  // Sample mock data
  const mockData = [
    {
      id: 'tw_123',
      text: "Flood waters rising in downtown Manhattan! #NYCFlood",
      user: { screen_name: "NYCWeatherWatch" },
      created_at: new Date().toISOString()
    },
    {
      id: 'tw_456',
      text: "Avoid Broadway area - roads completely submerged #DisasterAlert",
      user: { screen_name: "TrafficNYC" },
      created_at: new Date().toISOString()
    }
  ];
  
  res.json(mockData);
});

module.exports = router;