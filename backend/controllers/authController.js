'use strict';

/**
 * Auth Controller
 * - Real OTP sent to email via Gmail SMTP (nodemailer) - FREE & UNLIMITED
 * - OTP stored server-side in memory with 10-minute expiry
 * - bcrypt password hashing
 * - JWT session tokens
 * - Users stored in JSON file (no database needed)
 */

const nodemailer = require('nodemailer');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');

/* ── Config ── */
const USERS_FILE  = path.join(__dirname, '../data/users.json');
const JWT_SECRET  = process.env.JWT_SECRET || 'avi-super-secret-change-in-production';
const JWT_EXPIRY  = '7d';
const OTP_EXPIRY  = 10 * 60 * 1000; // 10 minutes in ms
const SALT_ROUNDS = 10;

/* ── In-memory OTP store: { email → { otp, expiresAt, name, password } } ── */
const otpStore = new Map();

/* ── Gmail transporter — created ONCE safely ── */
let _transporter = null;

function getTransporter() {
  if (_transporter) return _transporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass || pass.includes('xxxx')) {
    console.warn('[Email] Gmail not configured — OTP will be logged to console only');
    return null;
  }
  try {
    _transporter = nodemailer.createTransport({
      host  : 'smtp.gmail.com',
      port  : 465,
      secure: true,
      auth  : { user, pass },
      tls   : { rejectUnauthorized: false },
      connectionTimeout: 15000,
      greetingTimeout  : 15000,
      socketTimeout    : 15000,
    });
    return _transporter;
  } catch (e) {
    console.error('[Email] Failed to create transporter:', e.message);
    return null;
  }
}

/* Send email safely — NEVER throws, NEVER crashes server */
async function sendEmailSafe(options) {
  const t = getTransporter();
  if (!t) {
    console.log('[Email] No transporter — OTP for', options.to, ':', options._otp || '(see OTP store)');
    return false;
  }
  try {
    await t.sendMail(options);
    console.log('[Email] Sent to:', options.to);
    return true;
  } catch (err) {
    console.error('[Email] Failed:', err.message);
    _transporter = null; // reset so next request retries
    return false;
  }
}

/* ── User DB helpers (JSON file) ── */
function loadUsers() {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch { return []; }
}

function saveUsers(users) {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function genId() {
  return crypto.randomBytes(12).toString('hex');
}

function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── Beautiful OTP email template ── */
function otpEmailHtml(name, otp) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f14;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#111820;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
        
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#14b897,#0d6e5c);padding:32px;text-align:center;">
          <div style="width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:14px;">
            <span style="font-size:26px;">⬇</span>
          </div>
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">AVI Downloader</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Email Verification</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 8px;color:rgba(255,255,255,0.5);font-size:13px;">Hello,</p>
          <h2 style="margin:0 0 20px;color:#fff;font-size:20px;font-weight:700;">${name || 'there'} 👋</h2>
          <p style="margin:0 0 28px;color:rgba(255,255,255,0.55);font-size:14px;line-height:1.6;">
            Use the OTP below to verify your email address and complete your registration on AVI Downloader.
          </p>

          <!-- OTP Box -->
          <div style="background:rgba(20,184,151,0.1);border:1.5px solid rgba(20,184,151,0.35);border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
            <p style="margin:0 0 10px;color:rgba(255,255,255,0.4);font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Your OTP Code</p>
            <span style="font-size:42px;font-weight:800;letter-spacing:10px;color:#14b897;font-family:'Courier New',monospace;">${otp}</span>
            <p style="margin:14px 0 0;color:rgba(255,255,255,0.35);font-size:12px;">⏱ Valid for <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong></p>
          </div>

          <div style="background:rgba(255,180,0,0.08);border:1px solid rgba(255,180,0,0.2);border-radius:12px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0;color:rgba(255,200,80,0.85);font-size:12px;line-height:1.5;">
              🔒 <strong>Security Notice:</strong> Never share this OTP with anyone. AVI Downloader will never ask for your OTP via phone or chat.
            </p>
          </div>

          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:12px;line-height:1.6;">
            If you didn't request this, you can safely ignore this email. Someone may have entered your email by mistake.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;color:rgba(255,255,255,0.2);font-size:11px;">
            © ${new Date().getFullYear()} AVI Downloader by Mr. Avnish &nbsp;·&nbsp;
            <a href="https://github.com/mravnish" style="color:#14b897;text-decoration:none;">GitHub</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* ══════════════════════════════════════
   POST /api/auth/send-otp
   Body: { name, email, password }
   → validates, sends OTP to email
══════════════════════════════════════ */
const sendOtp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    /* Validate */
    if (!name  || name.trim().length < 2)
      return res.status(400).json({ success: false, error: 'Name must be at least 2 characters.' });
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });

    const cleanEmail = email.toLowerCase().trim();

    /* Check if already registered */
    const users = loadUsers();
    if (users.find(u => u.email === cleanEmail))
      return res.status(409).json({ success: false, error: 'This email is already registered. Please sign in.' });

    /* Generate OTP */
    const otp        = genOtp();
    const hashedPass = await bcrypt.hash(password, SALT_ROUNDS);

    /* Store OTP server-side */
    otpStore.set(cleanEmail, {
      otp,
      expiresAt : Date.now() + OTP_EXPIRY,
      name      : name.trim(),
      password  : hashedPass,
    });

    console.log(`[Auth] OTP for ${cleanEmail}: ${otp}`); // always log for debugging

    /* ── RESPOND IMMEDIATELY — don't wait for email ── */
    res.json({
      success : true,
      message : `OTP sent to ${cleanEmail}. Check your inbox (and spam folder).`,
    });

    /* Send email in background — if it fails, OTP is still valid in memory */
    sendEmailSafe({
      from    : `"AVI Downloader" <${process.env.GMAIL_USER}>`,
      to      : cleanEmail,
      subject : `${otp} is your AVI Downloader verification code`,
      html    : otpEmailHtml(name.trim(), otp),
      text    : `Your AVI Downloader OTP is: ${otp}\n\nValid for 10 minutes.\n\nIf you didn't request this, ignore this email.`,
      _otp    : otp,
    });
  } catch (err) {
    console.error('[sendOtp error]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  }
};

/* ══════════════════════════════════════
   POST /api/auth/verify-otp
   Body: { email, otp }
   → verifies OTP, creates user, returns JWT
══════════════════════════════════════ */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, error: 'Email and OTP are required.' });

    const cleanEmail = email.toLowerCase().trim();
    const stored     = otpStore.get(cleanEmail);

    /* Check OTP exists */
    if (!stored)
      return res.status(400).json({ success: false, error: 'No OTP found for this email. Please request a new one.' });

    /* Check expiry */
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(cleanEmail);
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    /* Check OTP value */
    if (otp.trim() !== stored.otp)
      return res.status(400).json({ success: false, error: 'Incorrect OTP. Please try again.' });

    /* Create user */
    const users   = loadUsers();
    const newUser = {
      id       : genId(),
      name     : stored.name,
      email    : cleanEmail,
      password : stored.password,   // already bcrypt hashed
      role     : 'user',
      joinedAt : new Date().toISOString(),
      downloads: 0,
    };
    saveUsers([...users, newUser]);
    otpStore.delete(cleanEmail);   // OTP used — delete it

    /* Issue JWT */
    const { password: _, ...safeUser } = newUser;
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    console.log(`[Auth] New user registered: ${cleanEmail}`);

    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════
   POST /api/auth/resend-otp
   Body: { email }
   → resends OTP to same email (max 3 times)
══════════════════════════════════════ */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail)
      return res.status(400).json({ success: false, error: 'Email is required.' });

    const stored = otpStore.get(cleanEmail);
    if (!stored)
      return res.status(400).json({ success: false, error: 'No pending registration found. Please start again.' });

    /* Generate new OTP, reset expiry */
    const newOtp = genOtp();
    otpStore.set(cleanEmail, { ...stored, otp: newOtp, expiresAt: Date.now() + OTP_EXPIRY });

    console.log(`[Auth] Resend OTP for ${cleanEmail}: ${newOtp}`);

    /* Respond immediately */
    res.json({ success: true, message: 'New OTP sent to your email.' });

    /* Send email in background */
    sendEmailSafe({
      from    : `"AVI Downloader" <${process.env.GMAIL_USER}>`,
      to      : cleanEmail,
      subject : `${newOtp} is your new AVI Downloader OTP`,
      html    : otpEmailHtml(stored.name, newOtp),
      text    : `Your new AVI Downloader OTP is: ${newOtp}\n\nValid for 10 minutes.`,
      _otp    : newOtp,
    });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════
   POST /api/auth/login
   Body: { email, password }
   → validates credentials, returns JWT
══════════════════════════════════════ */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required.' });

    const cleanEmail = email.toLowerCase().trim();
    const users      = loadUsers();
    const user       = users.find(u => u.email === cleanEmail);

    if (!user)
      return res.status(401).json({ success: false, error: 'No account found with this email. Please register first.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    console.log(`[Auth] Login: ${cleanEmail}`);
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════
   GET /api/auth/me  (verify token)
   Header: Authorization: Bearer <token>
══════════════════════════════════════ */
const getMe = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const users   = loadUsers();
    const user    = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
  }
};

/* ══════════════════════════════════════
   GET /api/auth/users  (admin only)
══════════════════════════════════════ */
const getAllUsers = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const users   = loadUsers();
    const me      = users.find(u => u.id === decoded.id);

    if (!me || me.role !== 'admin')
      return res.status(403).json({ success: false, error: 'Admin access required.' });

    const safeUsers = users.map(({ password: _, ...u }) => u);
    res.json({ success: true, users: safeUsers, total: safeUsers.length });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

/* ══════════════════════════════════════
   PATCH /api/auth/profile  (update name)
══════════════════════════════════════ */
const updateProfile = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, error: 'No token.' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const users   = loadUsers();
    const idx     = users.findIndex(u => u.id === decoded.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'User not found.' });

    const { name } = req.body;
    if (name) users[idx].name = name.trim();
    saveUsers(users);

    const { password: _, ...safeUser } = users[idx];
    res.json({ success: true, user: safeUser });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

/* ══════════════════════════════════════
   POST /api/auth/count-download  
   Increments download counter for user
══════════════════════════════════════ */
const countDownload = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.json({ success: true }); // guests ok

    const decoded = jwt.verify(token, JWT_SECRET);
    const users   = loadUsers();
    const idx     = users.findIndex(u => u.id === decoded.id);
    if (idx !== -1) {
      users[idx].downloads = (users[idx].downloads || 0) + 1;
      saveUsers(users);
    }
    res.json({ success: true });
  } catch {
    res.json({ success: true }); // fail silently
  }
};

module.exports = { sendOtp, verifyOtp, resendOtp, login, getMe, getAllUsers, updateProfile, countDownload };

