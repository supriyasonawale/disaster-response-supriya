const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const USER_AGENT = process.env.USER_AGENT;
// In all route files (verification.js, geocode.js, etc.)
const { supabase } = require('../utils/initSupabase');

// Function to geocode with OpenStreetMap
async function geocodeWithOSM(locationName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (response.data && response.data.length > 0) {
    const result = response.data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      locationName: result.display_name,
    };
  } else {
    throw new Error('Geocoding failed with OSM');
  }
}

// ✅ Main function to extract location from description and geocode
async function extractAndGeocode(description) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

  const prompt = `From this text: "${description}", extract ONLY the city or place name. Return just the name.`;

  const result = await model.generateContent({
    contents: [{ parts: [{ text: prompt }] }],
  });

  const locationName = result.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!locationName) {
    throw new Error('Gemini failed to extract location name');
  }

  // Geocode using OpenStreetMap
  return await geocodeWithOSM(locationName);
}

module.exports = { extractAndGeocode };
