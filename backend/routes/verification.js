const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const { get: getCache, set: setCache } = require('../utils/cache');

const { supabase } = require('../utils/initSupabase');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /disasters/:id/verify-image
router.post('/:id/verify-image', async (req, res) => {
  try {
    const imageUrl = req.body.imageUrl || req.body.image_url;
    const disasterId = req.params.id;
    const cacheKey = `verify:${imageUrl}`;
    
    if (!imageUrl) return res.status(400).json({ error: "Missing image_url" });

    // Check cache
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ cached: true, ...cached });
    
    // Download image
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-pro" });
    
    const prompt = `
      Analyze this disaster image for authenticity. Check for:
      1. Signs of digital manipulation
      2. Consistency with disaster context
      3. Geolocation clues matching reported location

      Output JSON: 
      {
        "status": "verified" | "suspicious" | "unverified",
        "confidence": number (0-100),
        "reasons": ["..."]
      }
    `;
    
    const imageData = {
      inlineData: {
        data: Buffer.from(imageResponse.data).toString('base64'),
        mimeType: imageResponse.headers['content-type']
      }
    };

    const result = await model.generateContent([prompt, imageData]);
    
    let verification;
    try {
      verification = JSON.parse((await result.response.text()).trim());
    } catch (e) {
      verification = {
        status: 'unverified',
        confidence: 50,
        reasons: ['Could not parse Gemini response']
      };
    }

    // Update database (if image_url exists in reports table)
    const { error } = await supabase
      .from('reports')
      .update({
        verification_status: verification.status,
        confidence_score: verification.confidence,
        analysis: verification.reasons
      })
      .eq('disaster_id', disasterId)
      .eq('image_url', imageUrl);

    if (error) throw error;

    // Cache result
    await setCache(cacheKey, verification, 1800);

    res.json({ cached: false, ...verification });
  } catch (error) {
    console.error('Image verification error:', error.message);
    res.status(500).json({
      error: 'Image verification failed',
      details: error.message
    });
  }
});

module.exports = router;
