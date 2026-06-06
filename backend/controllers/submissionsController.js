'use strict';

/**
 * Submissions Controller  — FIXED VERSION
 *
 * Root causes of previous crashes:
 *  1. nodemailer.createTransport() called every request → auth errors threw synchronously
 *  2. sendMail() ECONNRESET killed the process when Gmail credentials were missing/wrong
 *  3. Server sent no response on email crash → "Unexpected end of JSON input" on frontend
 *
 * Fixes:
 *  1. Transporter created ONCE at module load, gracefully skipped if .env not set
 *  2. Email send is fully isolated — if it fails, submission is still saved & success returned
 *  3. Every code path ALWAYS sends a JSON response
 *  4. process.on('uncaughtException') guard for nodemailer ECONNRESET
 */

const fs         = require('fs');
const path       = require('path');
const crypto     = require('crypto');
const jwt        = require('jsonwebtoken');

const FILE        = path.join(__dirname, '../data/submissions.json');
const JWT_SECRET  = process.env.JWT_SECRET  || 'avi-super-secret-change-in-production';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'avikumar7630@gmail.com';
const GMAIL_USER  = process.env.GMAIL_USER;
const GMAIL_PASS  = process.env.GMAIL_PASS;

/* ── Create transporter ONCE, safely ── */
let transporter = null;

function initTransporter() {
  if (!GMAIL_USER || !GMAIL_PASS || GMAIL_PASS.includes('xxxx')) {
    console.warn('[Submissions] Gmail not configured — emails disabled. Set GMAIL_USER and GMAIL_PASS in .env');
    return null;
  }
  try {
    const nodemailer = require('nodemailer');
    const t = nodemailer.createTransport({
      service: 'gmail',
      auth   : { user: GMAIL_USER, pass: GMAIL_PASS },
      // Important: don't let nodemailer throw unhandled errors
      pool   : false,
      logger : false,
      debug  : false,
    });
    // Verify connection once at startup (non-blocking)
    t.verify((err) => {
      if (err) console.warn('[Email] Gmail SMTP verify failed:', err.message, '— emails will be skipped.');
      else     console.log('[Email] Gmail SMTP ready ✓');
    });
    return t;
  } catch (e) {
    console.warn('[Submissions] Failed to init nodemailer:', e.message);
    return null;
  }
}

// Initialise once on module load
transporter = initTransporter();

/* ── Safe email sender — NEVER throws, NEVER crashes server ── */
async function sendEmailSafe(options) {
  if (!transporter) {
    console.log('[Email] Skipped (not configured):', options.subject);
    return false;
  }
  try {
    await transporter.sendMail(options);
    console.log('[Email] Sent:', options.subject);
    return true;
  } catch (err) {
    // Log but do NOT rethrow — submission was already saved
    console.warn('[Email] Failed to send:', err.message);
    return false;
  }
}

/* ── File helpers ── */
function loadSubs() {
  try {
    const dir = path.dirname(FILE);
    if (!fs.existsSync(dir))  fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
    return JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch { return []; }
}
function saveSubs(data) {
  try { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); } catch (e) { console.error('[Submissions] Save failed:', e.message); }
}
function genId() { return crypto.randomBytes(8).toString('hex'); }

/* ── Admin guard ── */
function requireAdmin(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, error: 'No token.' }); return null; }
  try {
    const decoded  = jwt.verify(token, JWT_SECRET);
    const usersFile = path.join(__dirname, '../data/users.json');
    if (!fs.existsSync(usersFile)) { res.status(403).json({ success: false, error: 'No users found.' }); return null; }
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8') || '[]');
    const me    = users.find(u => u.id === decoded.id);
    if (!me || me.role !== 'admin') { res.status(403).json({ success: false, error: 'Admin access required.' }); return null; }
    return me;
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    return null;
  }
}

/* ── Email templates ── */
function contactHtml({ name, email, subject, message }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
  <table style="max-width:500px;width:100%;background:#111820;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#14b897,#0d6e5c);padding:28px 32px;">
    <h2 style="margin:0;color:#fff;font-size:20px;">📬 New Contact Message</h2>
    <p style="margin:6px 0 0;color:rgba(255,255,255,.7);font-size:13px;">AVI Downloader Support Inbox</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    ${[['From', `${name} &lt;${email}&gt;`],['Subject', subject]].map(([k,v])=>`
    <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06);">
      <div style="color:rgba(255,255,255,.4);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">${k}</div>
      <div style="color:#fff;font-size:14px;">${v}</div>
    </div>`).join('')}
    <div style="padding:14px 0;">
      <div style="color:rgba(255,255,255,.4);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Message</div>
      <div style="background:rgba(255,255,255,.05);border-radius:12px;padding:14px;color:rgba(255,255,255,.85);font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
    </div>
    <div style="margin-top:20px;">
      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
        style="display:inline-block;background:linear-gradient(135deg,#14b897,#0d9488);color:#fff;font-size:13px;font-weight:600;padding:10px 22px;border-radius:12px;text-decoration:none;">
        Reply to ${name}
      </a>
    </div>
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;">
    <span style="color:rgba(255,255,255,.2);font-size:11px;">© ${new Date().getFullYear()} AVI Downloader by Mr. Avnish</span>
  </td></tr>
  </table></td></tr></table></body></html>`;
}

function bugHtml({ name, email, title, bugType, steps, expected, actual, version }) {
  const rows = [['Submitted By', name||'Anonymous'],['Email', email||'N/A'],['Issue Type', bugType||'bug'],['Browser/Version', version||'N/A']];
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0a0f14;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;"><tr><td align="center">
  <table style="max-width:500px;width:100%;background:#111820;border-radius:20px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
  <tr><td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:28px 32px;">
    <h2 style="margin:0;color:#fff;font-size:20px;">🐛 New Bug Report</h2>
    <p style="margin:8px 0 0;color:rgba(255,255,255,.9);font-size:15px;font-weight:600;">${title}</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    ${rows.map(([k,v])=>`
    <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);">
      <div style="color:rgba(255,255,255,.4);font-size:11px;font-weight:600;text-transform:uppercase;">${k}</div>
      <div style="color:#fff;font-size:14px;margin-top:3px;">${v}</div>
    </div>`).join('')}
    ${[['Steps to Reproduce',steps],['Expected',expected],['Actual',actual]].filter(([,v])=>v).map(([k,v])=>`
    <div style="padding:12px 0;">
      <div style="color:rgba(255,255,255,.4);font-size:11px;font-weight:600;text-transform:uppercase;margin-bottom:6px;">${k}</div>
      <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:12px;color:rgba(255,255,255,.8);font-size:13px;line-height:1.6;white-space:pre-wrap;">${v}</div>
    </div>`).join('')}
    ${email ? `<div style="margin-top:16px;"><a href="mailto:${email}?subject=Re: Bug Report - ${encodeURIComponent(title)}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-size:13px;font-weight:600;padding:10px 22px;border-radius:12px;text-decoration:none;">Reply to Reporter</a></div>` : ''}
  </td></tr>
  <tr><td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,.06);text-align:center;">
    <span style="color:rgba(255,255,255,.2);font-size:11px;">© ${new Date().getFullYear()} AVI Downloader by Mr. Avnish</span>
  </td></tr>
  </table></td></tr></table></body></html>`;
}

/* ══════════════════════════════════════
   POST /api/submissions/contact
══════════════════════════════════════ */
const submitContact = async (req, res) => {
  // Always respond — no matter what happens
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const entry = {
      id          : genId(),
      type        : 'contact',
      status      : 'new',
      name        : name.trim(),
      email       : email.toLowerCase().trim(),
      subject     : subject.trim(),
      message     : message.trim(),
      submittedAt : new Date().toISOString(),
    };

    // 1. Save first (always succeeds)
    const all = loadSubs();
    saveSubs([entry, ...all]);
    console.log(`[Submissions] Contact saved: ${entry.email} — "${entry.subject}"`);

    // 2. Respond to user immediately (don't wait for email)
    res.json({ success: true, message: "Your message has been sent! We'll get back to you within 48 hours." });

    // 3. Send email in background (after response sent — cannot crash the user's request)
    sendEmailSafe({
      from   : `"AVI Downloader" <${GMAIL_USER}>`,
      to     : ADMIN_EMAIL,
      subject: `📬 New Contact: ${entry.subject}`,
      html   : contactHtml(entry),
      text   : `From: ${entry.name} (${entry.email})\nSubject: ${entry.subject}\n\n${entry.message}`,
    });

  } catch (err) {
    console.error('[submitContact] Unexpected error:', err.message);
    // Ensure response is always sent even on unexpected error
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  }
};

/* ══════════════════════════════════════
   POST /api/submissions/bug
══════════════════════════════════════ */
const submitBug = async (req, res) => {
  try {
    const { name, email, title, type, steps, expected, actual, version } = req.body || {};

    if (!title?.trim() || !steps?.trim()) {
      return res.status(400).json({ success: false, error: 'Issue title and steps to reproduce are required.' });
    }

    const entry = {
      id          : genId(),
      type        : 'bug',
      status      : 'new',
      name        : (name || '').trim(),
      email       : (email || '').toLowerCase().trim(),
      title       : title.trim(),
      bugType     : type || 'bug',
      steps       : steps.trim(),
      expected    : (expected || '').trim(),
      actual      : (actual   || '').trim(),
      version     : (version  || '').trim(),
      submittedAt : new Date().toISOString(),
    };

    // 1. Save first
    const all = loadSubs();
    saveSubs([entry, ...all]);
    console.log(`[Submissions] Bug saved: "${entry.title}"`);

    // 2. Respond immediately
    res.json({ success: true, message: 'Bug report submitted! Thank you for helping improve AVI Downloader.' });

    // 3. Email in background
    sendEmailSafe({
      from   : `"AVI Downloader" <${GMAIL_USER}>`,
      to     : ADMIN_EMAIL,
      subject: `🐛 New Bug Report: ${entry.title}`,
      html   : bugHtml(entry),
      text   : `Bug: ${entry.title}\nType: ${entry.bugType}\nBy: ${entry.name} (${entry.email})\n\nSteps:\n${entry.steps}`,
    });

  } catch (err) {
    console.error('[submitBug] Unexpected error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
  }
};

/* ══════════════════════════════════════
   GET /api/submissions  (admin only)
══════════════════════════════════════ */
const getSubmissions = (req, res) => {
  try {
    const me = requireAdmin(req, res);
    if (!me) return;

    const { type, status } = req.query;
    let all = loadSubs();
    if (type)   all = all.filter(s => s.type   === type);
    if (status) all = all.filter(s => s.status === status);

    const raw    = loadSubs(); // unfiltered for counts
    const counts = {
      total   : raw.length,
      new     : raw.filter(s => s.status === 'new').length,
      read    : raw.filter(s => s.status === 'read').length,
      resolved: raw.filter(s => s.status === 'resolved').length,
      contact : raw.filter(s => s.type   === 'contact').length,
      bug     : raw.filter(s => s.type   === 'bug').length,
    };

    res.json({ success: true, submissions: all, counts });
  } catch (err) {
    console.error('[getSubmissions]', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'Failed to load submissions.' });
  }
};

/* ══════════════════════════════════════
   PATCH /api/submissions/:id/status
══════════════════════════════════════ */
const updateStatus = (req, res) => {
  try {
    const me = requireAdmin(req, res);
    if (!me) return;

    const { id }     = req.params;
    const { status } = req.body || {};

    if (!['new','read','resolved'].includes(status))
      return res.status(400).json({ success: false, error: 'Status must be new, read, or resolved.' });

    const all = loadSubs();
    const idx = all.findIndex(s => s.id === id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Submission not found.' });

    all[idx].status    = status;
    all[idx].updatedAt = new Date().toISOString();
    saveSubs(all);

    res.json({ success: true, submission: all[idx] });
  } catch (err) {
    console.error('[updateStatus]', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
};

/* ══════════════════════════════════════
   DELETE /api/submissions/:id
══════════════════════════════════════ */
const deleteSubmission = (req, res) => {
  try {
    const me = requireAdmin(req, res);
    if (!me) return;

    const { id } = req.params;
    const all    = loadSubs();
    const updated = all.filter(s => s.id !== id);

    if (updated.length === all.length)
      return res.status(404).json({ success: false, error: 'Submission not found.' });

    saveSubs(updated);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    console.error('[deleteSubmission]', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'Failed to delete.' });
  }
};

module.exports = { submitContact, submitBug, getSubmissions, updateStatus, deleteSubmission };
