

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



/* ── Backend Landing Page ── */
app.get('/', (_req, res) => {
  const version = require('./package.json').version;

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AVI Downloader API</title>

<style>
:root{
  --bg:#0b1120;
  --card:#111827;
  --border:#1f2937;
  --primary:#06b6d4;
  --text:#f8fafc;
  --muted:#94a3b8;
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family:Inter,Segoe UI,sans-serif;
  background:linear-gradient(135deg,#020617,#0f172a);
  color:var(--text);
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:24px;
}

.container{
  width:100%;
  max-width:950px;
}

.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:24px;
  padding:40px;
  box-shadow:0 25px 60px rgba(0,0,0,.4);
}

.logo{
  font-size:60px;
  text-align:center;
  margin-bottom:10px;
}

h1{
  text-align:center;
  margin-bottom:10px;
}

.subtitle{
  text-align:center;
  color:var(--muted);
  margin-bottom:35px;
}

.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:16px;
}

.box{
  background:#0f172a;
  border:1px solid var(--border);
  border-radius:16px;
  padding:18px;
}

.box h3{
  color:var(--primary);
  margin-bottom:8px;
}

.actions{
  display:flex;
  gap:12px;
  justify-content:center;
  flex-wrap:wrap;
  margin-top:30px;
}

.btn{
  background:var(--primary);
  color:#001018;
  text-decoration:none;
  padding:12px 18px;
  border-radius:12px;
  font-weight:700;
}

.btn-outline{
  border:1px solid var(--border);
  color:white;
  text-decoration:none;
  padding:12px 18px;
  border-radius:12px;
}

.footer{
  text-align:center;
  color:var(--muted);
  margin-top:25px;
}
</style>
</head>

<body>

<div class="container">
  <div class="card">

    <div class="logo">🚀</div>

    <h1>AVI Downloader API</h1>

    <p class="subtitle">
      Production Backend Service Running Successfully
    </p>

    <div class="grid">

      <div class="box">
        <h3>Status</h3>
        <p>🟢 Online</p>
      </div>

      <div class="box">
        <h3>Version</h3>
        <p>${version}</p>
      </div>

      <div class="box">
        <h3>Environment</h3>
        <p>${process.env.NODE_ENV || 'development'}</p>
      </div>

      <div class="box">
        <h3>Uptime</h3>
        <p>${Math.floor(process.uptime())} sec</p>
      </div>

    </div>

    <div class="actions">

      <a href="/api/health" class="btn">
        Health Check
      </a>

      <a href="${process.env.FRONTEND_URL || '#'}" class="btn-outline">
        Open Frontend
      </a>

    </div>

    <div class="footer">
      AVI Downloader Backend © ${new Date().getFullYear()}
    </div>

  </div>
</div>

</body>
</html>
  `);
});

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
