const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Middleware
// Configure CORS to allow the frontend origin(s) from env var FRONTEND_URL.
// FRONTEND_URL may be a single origin or a comma-separated list.
const frontendEnv = process.env.FRONTEND_URL || '';
const normalizeOrigin = (u) => (u || '').toString().trim().replace(/\/+$/, '').toLowerCase();
let allowedOrigins = frontendEnv ? frontendEnv.split(',').map((s) => normalizeOrigin(s)) : [];
// If FRONTEND_URL is not configured or still the placeholder, allow all origins
if (!frontendEnv || frontendEnv.includes('your-frontend-url')) {
  allowedOrigins = ['*'];
}
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser or same-origin requests
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.includes('*') || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn('CORS blocked origin:', origin);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/ratings", ratingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// API root - provide a small helpful summary for GET /api
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'SmartMess API - available endpoints',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      ratings: '/api/ratings',
      health: '/api/health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
