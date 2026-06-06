'use strict';

const fs   = require('fs');
const path = require('path');
const jwt  = require('jsonwebtoken');

const USERS_FILE  = path.join(__dirname, '../data/users.json');
const STATS_FILE  = path.join(__dirname, '../data/stats.json');
const JWT_SECRET  = process.env.JWT_SECRET || 'avi-super-secret-change-in-production';

/* ── Helpers ── */
function loadUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch { return []; }
}
function saveUsers(u) { fs.writeFileSync(USERS_FILE, JSON.stringify(u, null, 2)); }

function loadStats() {
  try {
    if (!fs.existsSync(STATS_FILE)) return defaultStats();
    return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
  } catch { return defaultStats(); }
}
function saveStats(s) {
  const dir = path.dirname(STATS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATS_FILE, JSON.stringify(s, null, 2));
}
function defaultStats() {
  return {
    totalDownloads   : 0,
    playlistDownloads: 0,
    singleDownloads  : 0,
    daily            : {},   // { "2026-05-19": { total, playlist, single } }
  };
}

/* ── Auth middleware ── */
function requireAdmin(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ success: false, error: 'No token.' }); return null; }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users   = loadUsers();
    const me      = users.find(u => u.id === decoded.id);
    if (!me || me.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Admin access required.' });
      return null;
    }
    return me;
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    return null;
  }
}

/* ══════════════════════════════════════
   GET /api/admin/stats
   Real dashboard stats
══════════════════════════════════════ */
const getStats = (req, res) => {
  const me = requireAdmin(req, res);
  if (!me) return;

  const users = loadUsers();
  const stats = loadStats();

  /* Build last-7-days array */
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d   = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7.push({
      date    : key,
      label   : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      total   : stats.daily[key]?.total    || 0,
      playlist: stats.daily[key]?.playlist || 0,
      single  : stats.daily[key]?.single   || 0,
    });
  }

  /* New users last 7 days */
  const newUsersLast7 = users.filter(u => {
    const d = new Date(u.joinedAt);
    const diff = (Date.now() - d) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  /* Most active user */
  const sorted      = [...users].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  const topUser     = sorted[0] || null;
  const totalDls    = users.reduce((s, u) => s + (u.downloads || 0), 0);

  res.json({
    success: true,
    stats  : {
      totalUsers       : users.length,
      newUsersLast7,
      totalDownloads   : stats.totalDownloads || totalDls,
      playlistDownloads: stats.playlistDownloads || 0,
      singleDownloads  : stats.singleDownloads   || 0,
      topUser          : topUser ? { name: topUser.name, email: topUser.email, downloads: topUser.downloads } : null,
      last7Days        : last7,
      serverUptime     : Math.floor(process.uptime()),
    },
  });
};

/* ══════════════════════════════════════
   GET /api/admin/users
   All users with safe fields
══════════════════════════════════════ */
const getUsers = (req, res) => {
  const me = requireAdmin(req, res);
  if (!me) return;

  const users     = loadUsers();
  const safeUsers = users.map(({ password: _, ...u }) => u);

  res.json({ success: true, users: safeUsers, total: safeUsers.length });
};

/* ══════════════════════════════════════
   DELETE /api/admin/users/:id
   Delete a user (admin cannot delete self)
══════════════════════════════════════ */
const deleteUser = (req, res) => {
  const me = requireAdmin(req, res);
  if (!me) return;

  const { id } = req.params;
  if (id === me.id)
    return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });

  const users   = loadUsers();
  const updated = users.filter(u => u.id !== id);
  if (updated.length === users.length)
    return res.status(404).json({ success: false, error: 'User not found.' });

  saveUsers(updated);
  res.json({ success: true, message: 'User deleted.' });
};

/* ══════════════════════════════════════
   PATCH /api/admin/users/:id/role
   Toggle user role between user/admin
══════════════════════════════════════ */
const toggleRole = (req, res) => {
  const me = requireAdmin(req, res);
  if (!me) return;

  const { id }   = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role))
    return res.status(400).json({ success: false, error: 'Role must be "user" or "admin".' });
  if (id === me.id)
    return res.status(400).json({ success: false, error: 'You cannot change your own role.' });

  const users = loadUsers();
  const idx   = users.findIndex(u => u.id === id);
  if (idx === -1)
    return res.status(404).json({ success: false, error: 'User not found.' });

  users[idx].role = role;
  saveUsers(users);
  const { password: _, ...safeUser } = users[idx];
  res.json({ success: true, user: safeUser });
};

/* ══════════════════════════════════════
   POST /api/admin/track
   Called by backend after every download
   to increment real stats counters
══════════════════════════════════════ */
const trackDownload = (req, res) => {
  try {
    const { type = 'single', userId } = req.body;  // type: 'playlist' | 'single'
    const stats = loadStats();
    const today = new Date().toISOString().slice(0, 10);

    stats.totalDownloads    = (stats.totalDownloads || 0) + 1;
    if (type === 'playlist') stats.playlistDownloads = (stats.playlistDownloads || 0) + 1;
    else                     stats.singleDownloads   = (stats.singleDownloads   || 0) + 1;

    if (!stats.daily[today]) stats.daily[today] = { total: 0, playlist: 0, single: 0 };
    stats.daily[today].total++;
    if (type === 'playlist') stats.daily[today].playlist++;
    else                     stats.daily[today].single++;

    // Also increment user download count
    if (userId) {
      const users = loadUsers();
      const idx   = users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        users[idx].downloads = (users[idx].downloads || 0) + 1;
        saveUsers(users);
      }
    }

    saveStats(stats);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: true }); // fail silently
  }
};

module.exports = { getStats, getUsers, deleteUser, toggleRole, trackDownload };
