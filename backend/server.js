'use strict';

require('dotenv').config();

/* ──────────────────────────────────────────────
   Global Error Protection
────────────────────────────────────────────── */
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

/* ──────────────────────────────────────────────
   Imports
────────────────────────────────────────────── */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const playlistRoutes = require('./routes/playlist');
const downloadRoutes = require('./routes/download');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const socialRoutes = require('./routes/social');
const submissionsRoutes = require('./routes/submissions');
const audioRoutes = require('./routes/audio');

const app = express();
const PORT = process.env.PORT || 5000;

/* ──────────────────────────────────────────────
   Trust Proxy (Render / Railway / VPS)
────────────────────────────────────────────── */
app.set('trust proxy', 1);

/* ──────────────────────────────────────────────
   Security
────────────────────────────────────────────── */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

/* ──────────────────────────────────────────────
   CORS
────────────────────────────────────────────── */
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

/* ──────────────────────────────────────────────
   Body Parsers
────────────────────────────────────────────── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ──────────────────────────────────────────────
   Global Rate Limit
────────────────────────────────────────────── */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

app.use('/api', apiLimiter);

/* ──────────────────────────────────────────────
   Login Protection
────────────────────────────────────────────── */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. Try again later.',
  },
});

app.use('/api/auth/login', loginLimiter);

/* ──────────────────────────────────────────────
   OTP Protection
────────────────────────────────────────────── */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many OTP requests. Please wait.',
  },
});

app.use('/api/auth/send-otp', otpLimiter);

/* ──────────────────────────────────────────────
   Health Check
────────────────────────────────────────────── */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    version: require('./package.json').version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/* ──────────────────────────────────────────────
   Routes
────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/download', downloadRoutes);

/* ──────────────────────────────────────────────
   API Info
────────────────────────────────────────────── */
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    name: 'AVI Downloader API',
    version: require('./package.json').version,
    endpoints: {
      auth: '/api/auth',
      playlist: '/api/playlist',
      download: '/api/download',
      audio: '/api/audio',
      social: '/api/social',
      admin: '/api/admin',
      submissions: '/api/submissions',
      health: '/api/health',
    },
  });
});

/* ──────────────────────────────────────────────
   404 Handler
────────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
    path: req.originalUrl,
  });
});

/* ──────────────────────────────────────────────
   Error Handler
────────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);

  res.status(err.status || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error.'
        : err.message,
  });
});

/* ──────────────────────────────────────────────
   Start Server
────────────────────────────────────────────── */
const server = app.listen(PORT, () => {
  console.log('\n================================');
  console.log('🚀 AVI Downloader Backend');
  console.log('================================');
  console.log(`PORT       : ${PORT}`);
  console.log(`MODE       : ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `FRONTEND   : ${
      process.env.FRONTEND_URL || 'http://localhost:5173'
    }`
  );
  console.log(`EMAIL      : ${process.env.GMAIL_USER || 'Not Configured'}`);
  console.log(`HEALTH URL : /api/health`);
  console.log('================================\n');
});

/* ──────────────────────────────────────────────
   Graceful Shutdown
────────────────────────────────────────────── */
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

module.exports = app;



// 'use strict';
// require('dotenv').config();

// /* ── Prevent ECONNRESET / nodemailer errors from killing the process ── */
// process.on('uncaughtException',  (err) => console.error('[uncaughtException]',  err.message));
// process.on('unhandledRejection', (err) => console.error('[unhandledRejection]', err?.message || err));

// const express   = require('express');
// const cors      = require('cors');
// const helmet    = require('helmet');
// const rateLimit = require('express-rate-limit');

// const playlistRoutes    = require('./routes/playlist');
// const downloadRoutes    = require('./routes/download');
// const authRoutes        = require('./routes/auth');
// const adminRoutes       = require('./routes/admin');
// const socialRoutes      = require('./routes/social');
// const submissionsRoutes = require('./routes/submissions');
// const audioRoutes       = require('./routes/audio');

// const app  = express();
// const PORT = process.env.PORT || 5000;

// /* ── Security ── */
// app.use(helmet({
//   crossOriginEmbedderPolicy : false,
//   crossOriginResourcePolicy : { policy: 'cross-origin' },
// }));

// app.use(cors({
//   origin     : process.env.FRONTEND_URL || 'http://localhost:5173',
//   methods    : ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
//   credentials: true,
// }));

// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({ extended: false }));

// /* ── Global rate limit — generous for normal use ── */
// app.use('/api/', rateLimit({
//   windowMs       : 15 * 60 * 1000,  // 15 minutes
//   max            : 500,              // 500 requests per 15 min per IP (was 120 — too tight)
//   standardHeaders: true,
//   legacyHeaders  : false,
//   skip           : (req) => req.path === '/auth/me', // never rate-limit session restore
//   message        : { success: false, error: 'Too many requests. Please wait a moment.' },
// }));

// /* ── Auth actions limit (login/register) — prevent brute force ── */
// app.use('/api/auth/login', rateLimit({
//   windowMs: 15 * 60 * 1000,   // 15 minutes
//   max     : 20,                // 20 login attempts per 15 min (was part of 120 global)
//   message : { success: false, error: 'Too many login attempts. Please wait 15 minutes.' },
// }));

// /* ── OTP send limit — prevent email spam ── */
// app.use('/api/auth/send-otp', rateLimit({
//   windowMs: 60 * 60 * 1000,   // 1 hour
//   max     : 10,                // 10 OTP requests per hour (was 5 — too strict for dev)
//   message : { success: false, error: 'Too many OTP requests. Please wait an hour.' },
// }));

// /* ── Routes ── */
// app.use('/api/auth',        authRoutes);
// app.use('/api/admin',       adminRoutes);
// app.use('/api/social',      socialRoutes);
// app.use('/api/audio',       audioRoutes);
// app.use('/api/submissions', submissionsRoutes);
// app.use('/api/playlist',    playlistRoutes);
// app.use('/api/download',    downloadRoutes);

// /* ── Health ── */
// app.get('/api/health', (_req, res) => {
//   res.json({
//     success  : true,
//     status   : 'ok',
//     version  : require('./package.json').version,
//     uptime   : Math.floor(process.uptime()),
//     timestamp: new Date().toISOString(),
//   });
// });

// /* ── 404 ── */
// app.use((_req, res) => {
//   res.status(404).json({ success: false, error: 'Route not found.' });
// });

// /* ── Global error handler ── */
// app.use((err, _req, res, _next) => {
//   console.error('[Server Error]', err.message);
//   res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error.' });
// });

// app.listen(PORT, () => {
//   console.log(`\n🚀  AVI Backend  →  http://localhost:${PORT}`);
//   console.log(`    Frontend     →  ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
//   console.log(`    Email        →  ${process.env.GMAIL_USER || '⚠️  GMAIL_USER not set in .env'}`);
//   console.log(`    Mode         →  ${process.env.NODE_ENV || 'development'}\n`);
// });

// module.exports = app;
