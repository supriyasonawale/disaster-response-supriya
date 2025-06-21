const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");
const { getFromCache, setCache } = require('./cacheService');

// ✅ Initialize Gemini
let genAI;
try {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment variables');
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini initialized with key starting with:',
    process.env.GEMINI_API_KEY.slice(0, 6) + '...');
} catch (error) {
  console.error('❌ Gemini initialization failed:', error.message);
}

// 🔍 Step 1: Extract location using Gemini
async function extractLocation(description) {
  if (!genAI) throw new Error('Gemini client not initialized');

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
    requestOptions: { timeout: 10000 }
  });

  const prompt = `
You are a location extractor AI.
Extract the location mentioned in this disaster report. Respond with only the location name.

Description: "${description}"
`;

  const result = await model.generateContent(prompt);
  const text = await result.response.text();
  return text.trim().replace(/^"|"$/g, ''); // clean quotes
}

// 🌍 Step 2: Geocode using OpenStreetMap (Nominatim)
async function geocodeLocation(locationName) {
  const cacheKey = `geocode_${locationName}`;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const url = 'https://nominatim.openstreetmap.org/search';
  const params = {
    q: locationName,
    format: 'json',
    limit: 1,
  };

  const headers = {
    'User-Agent': process.env.USER_AGENT || 'DisasterResponseApp/1.0',
  };

  const response = await axios.get(url, { params, headers });

  if (!response.data || response.data.length === 0) {
    throw new Error('Location not found');
  }

  const result = {
    lat: parseFloat(response.data[0].lat),
    lon: parseFloat(response.data[0].lon),
  };

  await setCache(cacheKey, result);
  return result;
}

// 🚀 Step 3: Combined workflow
async function extractLocationAndGeocode(description) {
  try {
    const location_name = await extractLocation(description);
    const coords = await geocodeLocation(location_name);
    return { location_name, ...coords };
  } catch (error) {
    console.error('❌ Location Service Error:', error.message);
    throw error;
  }
}

module.exports = {
  extractLocationAndGeocode
};
