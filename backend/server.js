'use strict';
require('dotenv').config();

/* ── Prevent ECONNRESET / nodemailer errors from killing the process ── */
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err?.message || err);
});

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

/* ── Security ── */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

/* ── Global rate limit ── */
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === '/auth/me',
    message: {
      success: false,
      error: 'Too many requests. Please wait a moment.',
    },
  })
);

/* ── Login rate limit ── */
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
      success: false,
      error: 'Too many login attempts. Please wait 15 minutes.',
    },
  })
);

/* ── OTP rate limit ── */
app.use(
  '/api/auth/send-otp',
  rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
      success: false,
      error: 'Too many OTP requests. Please wait an hour.',
    },
  })
);

/* =========================================================
   ROOT BACKEND UI
========================================================= */
app.get('/', (_req, res) => {
  const version = require('./package.json').version;

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<title>AVI Multi Downloader API</title>

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;
  background:#0f172a;
  color:#fff;
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  padding:20px;
}

.container{
  width:100%;
  max-width:900px;
}

.card{
  background:#1e293b;
  border-radius:20px;
  padding:40px;
  box-shadow:0 0 30px rgba(0,0,0,.4);
}

h1{
  text-align:center;
  margin-bottom:10px;
  font-size:2.5rem;
}

.subtitle{
  text-align:center;
  color:#94a3b8;
  margin-bottom:30px;
}

.status{
  text-align:center;
  margin-bottom:25px;
}

.badge{
  display:inline-block;
  background:#16a34a;
  color:white;
  padding:8px 16px;
  border-radius:50px;
  font-weight:bold;
}

.info-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:15px;
  margin-bottom:30px;
}

.info-box{
  background:#334155;
  padding:15px;
  border-radius:12px;
}

.info-box h3{
  margin-bottom:10px;
  color:#38bdf8;
}

.endpoints{
  margin-top:20px;
}

.endpoint{
  background:#0f172a;
  padding:12px 15px;
  margin-bottom:10px;
  border-radius:10px;
  display:flex;
  justify-content:space-between;
  flex-wrap:wrap;
}

.endpoint a{
  color:#38bdf8;
  text-decoration:none;
}

.footer{
  text-align:center;
  margin-top:25px;
  color:#94a3b8;
}

@media(max-width:600px){
  h1{
    font-size:1.8rem;
  }

  .card{
    padding:25px;
  }
}
</style>
</head>

<body>

<div class="container">

  <div class="card">

    <h1>🚀 AVI Multi Downloader API</h1>

    <p class="subtitle">
      Backend Server Running Successfully
    </p>

    <div class="status">
      <span class="badge">✅ ONLINE</span>
    </div>

    <div class="info-grid">

      <div class="info-box">
        <h3>Version</h3>
        <p>${version}</p>
      </div>

      <div class="info-box">
        <h3>Environment</h3>
        <p>${process.env.NODE_ENV || 'development'}</p>
      </div>

      <div class="info-box">
        <h3>Uptime</h3>
        <p>${Math.floor(process.uptime())} sec</p>
      </div>

      <div class="info-box">
        <h3>Server Time</h3>
        <p>${new Date().toLocaleString()}</p>
      </div>

    </div>

    <div class="endpoints">

      <h2 style="margin-bottom:15px;">
        Available API Endpoints
      </h2>

      <div class="endpoint">
        <span>Health Check</span>
        <a href="/api/health" target="_blank">
          /api/health
        </a>
      </div>

      <div class="endpoint">
        <span>Authentication</span>
        <span>/api/auth</span>
      </div>

      <div class="endpoint">
        <span>Playlist</span>
        <span>/api/playlist</span>
      </div>

      <div class="endpoint">
        <span>Download</span>
        <span>/api/download</span>
      </div>

      <div class="endpoint">
        <span>Audio</span>
        <span>/api/audio</span>
      </div>

      <div class="endpoint">
        <span>Social</span>
        <span>/api/social</span>
      </div>

      <div class="endpoint">
        <span>Submissions</span>
        <span>/api/submissions</span>
      </div>

      <div class="endpoint">
        <span>Admin</span>
        <span>/api/admin</span>
      </div>

    </div>

    <div class="footer">
      AVI Multi Downloader Backend © ${new Date().getFullYear()}
    </div>

  </div>

</div>

</body>
</html>
`);
});

/* ── API Routes ── */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/download', downloadRoutes);

/* ── Health ── */
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    version: require('./package.json').version,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/* ── 404 ── */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found.',
  });
});

/* ── Global Error Handler ── */
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error.',
  });
});

/* ── Start Server ── */
app.listen(PORT, () => {
  console.log(`\n🚀 AVI Backend → http://localhost:${PORT}`);
  console.log(
    `Frontend → ${process.env.FRONTEND_URL || 'http://localhost:5173'}`
  );
  console.log(
    `Email → ${
      process.env.GMAIL_USER ||
      '⚠️ GMAIL_USER not set in .env'
    }`
  );
  console.log(
    `Mode → ${process.env.NODE_ENV || 'development'}\n`
  );
});

module.exports = app;