const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const ratingRoutes = require("./routes/ratingRoutes");

const app = express();

// Middleware
// Configure CORS to allow the frontend origin(s) from env var FRONTEND_URL.
// FRONTEND_URL may be a single origin or a comma-separated list. If not set,
// fallback to allowing all origins (useful for local development).
const frontendEnv = process.env.FRONTEND_URL || '*';
const allowedOrigins = frontendEnv.split(',').map((s) => s.trim());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser or same-origin requests
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS_NOT_ALLOWED'));
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
