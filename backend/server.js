// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const { supabase } = require('./utils/initSupabase');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

// ✅ Test Supabase Connection
(async () => {
  const { data, error } = await supabase.from('resources').select('*').limit(1);
  console.log('✅ Supabase test:', data || error);
})();

console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Supabase Key starts with:", process.env.SUPABASE_KEY?.slice(0, 10));
console.log("Gemini API Key starts with:", process.env.GEMINI_API_KEY?.slice(0, 10));

// ✅ Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// ✅ Detailed Logger
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') {
    console.log('➡️ Body:', req.body);
  }
  next();
});

// ✅ Step 4: Health Check Endpoint (add before other routes)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Test Route
app.get('/api/test', (req, res) => {
  res.json({
    message: '✅ API is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ Diagnostic Route
app.get('/api/check-keys', (req, res) => {
  res.json({
    gemini: process.env.GEMINI_API_KEY 
      ? `Loaded (first 6: ${process.env.GEMINI_API_KEY.slice(0, 6)}...)` 
      : 'MISSING',
    node_env: process.env.NODE_ENV || 'development'
  });
});

// ✅ Routes
const disasterRoutes = require('./routes/disasterRoutes');
const geocodeRoutes = require('./routes/geocodingRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const socialMediaRoutes = require('./routes/socialMedia');
const verifyRoutes = require('./routes/verification');
const updateRoutes = require('./routes/updates');
const mockVerifyRoutes = require('./routes/mockVerify');

// ✅ Mount Routes
app.use('/api/disasters', disasterRoutes(io));
app.use('/api/geocode', geocodeRoutes);
app.use('/resources', resourceRoutes);
app.use('/disasters', verifyRoutes);
app.use('/social', socialMediaRoutes);
app.use('/updates', updateRoutes);
app.use('/mock-verify-image', mockVerifyRoutes);

// ✅ WebSocket Events
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);
  socket.on('disaster:subscribe', (disasterId) => {
    console.log(`📡 Subscribed to disaster-${disasterId}`);
    socket.join(`disaster-${disasterId}`);
  });
});

// ✅ Serve Frontend (if built)
const frontendPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  console.warn('⚠️  Frontend build folder not found. Skipping static serving.');
}

// ✅ Fallback for Unmatched Routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 UI (if build exists): http://localhost:${PORT}`);
});
