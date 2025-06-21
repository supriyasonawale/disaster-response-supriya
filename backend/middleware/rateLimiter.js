const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

const geminiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Gemini API quota exceeded'
});

module.exports = { apiLimiter, geminiLimiter };