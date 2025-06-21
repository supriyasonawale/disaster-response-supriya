// testKey.js
require('dotenv').config();

console.log('✅ Testing Gemini API Key:');

if (!process.env.GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env');
  process.exit(1);
}

console.log('Key starts with:', process.env.GEMINI_API_KEY.slice(0, 6) + '...');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testKey() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("What is 2+2?");
    const response = await result.response;
    console.log('✅ Gemini Response:', response.text());
  } catch (error) {
    console.error('❌ Gemini Error:', error);
  }
}

testKey();