'use strict';
require('dotenv').config();

/* ── Prevent ECONNRESET / nodemailer errors from killing the process ── */
process.on('uncaughtException',  (err) => console.error('[uncaughtException]',  err.message));
process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err?.message || err));

const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');

const playlistRoutes    = require('./routes/playlist');
const downloadRoutes    = require('./routes/download');
const authRoutes        = require('./routes/auth');
const adminRoutes       = require('./routes/admin');
const socialRoutes      = require('./routes/social');
const submissionsRoutes = require('./routes/submissions');
const audioRoutes       = require('./routes/audio');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Security ── */
app.use(helmet({
  crossOriginEmbedderPolicy : false,
  crossOriginResourcePolicy : { policy: 'cross-origin' },
}));

app.use(cors({
  origin     : process.env.FRONTEND_URL || 'http://localhost:5173',
  methods    : ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

/* ── Global rate limit — generous for normal use ── */
app.use('/api/', rateLimit({
  windowMs       : 15 * 60 * 1000,  // 15 minutes
  max            : 500,              // 500 requests per 15 min per IP (was 120 — too tight)
  standardHeaders: true,
  legacyHeaders  : false,
  skip           : (req) => req.path === '/auth/me', // never rate-limit session restore
  message        : { success: false, error: 'Too many requests. Please wait a moment.' },
}));

/* ── Auth actions limit (login/register) — prevent brute force ── */
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max     : 20,                // 20 login attempts per 15 min (was part of 120 global)
  message : { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
}));

/* ── OTP send limit — prevent email spam ── */
app.use('/api/auth/send-otp', rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max     : 10,                // 10 OTP requests per hour (was 5 — too strict for dev)
  message : { success: false, error: 'Too many OTP requests. Please wait an hour.' },
}));

/* ── Routes ── */
app.use('/api/auth',        authRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/social',      socialRoutes);
app.use('/api/audio',       audioRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/playlist',    playlistRoutes);
app.use('/api/download',    downloadRoutes);

/* ── Health ── */
app.get('/api/health', (_req, res) => {
  res.json({
    success  : true,
    status   : 'ok',
    version  : require('./package.json').version,
    uptime   : Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`\n🚀  AVI Backend  →  http://localhost:${PORT}`);
  console.log(`    Frontend     →  ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`    Email        →  ${process.env.GMAIL_USER || '⚠️  GMAIL_USER not set in .env'}`);
  console.log(`    Mode         →  ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
