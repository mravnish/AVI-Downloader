'use strict';

/**
 * Social Media Download Controller
 *
 * Powered by yt-dlp which supports 1000+ sites including:
 * Facebook, Instagram, Twitter/X, Snapchat, TikTok, Reddit,
 * Vimeo, Dailymotion, Twitch, Pinterest, LinkedIn, and more.
 *
 * No extra packages needed — yt-dlp handles everything.
 */

const { spawn, execFile } = require('child_process');
const { promisify }       = require('util');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');

const execFileAsync = promisify(execFile);

/* ── Platform detector ── */
const PLATFORMS = {
  facebook    : { pattern: /facebook\.com|fb\.watch/i,          name: 'Facebook',     ext: 'mp4' },
  instagram   : { pattern: /instagram\.com/i,                   name: 'Instagram',    ext: 'mp4' },
  twitter     : { pattern: /twitter\.com|x\.com|t\.co/i,        name: 'Twitter / X',  ext: 'mp4' },
  tiktok      : { pattern: /tiktok\.com|vm\.tiktok/i,           name: 'TikTok',       ext: 'mp4' },
  snapchat    : { pattern: /snapchat\.com/i,                     name: 'Snapchat',     ext: 'mp4' },
  reddit      : { pattern: /reddit\.com|redd\.it/i,             name: 'Reddit',       ext: 'mp4' },
  vimeo       : { pattern: /vimeo\.com/i,                        name: 'Vimeo',        ext: 'mp4' },
  dailymotion : { pattern: /dailymotion\.com|dai\.ly/i,         name: 'Dailymotion',  ext: 'mp4' },
  twitch      : { pattern: /twitch\.tv/i,                        name: 'Twitch',       ext: 'mp4' },
  pinterest   : { pattern: /pinterest\.com|pin\.it/i,           name: 'Pinterest',    ext: 'mp4' },
  linkedin    : { pattern: /linkedin\.com/i,                     name: 'LinkedIn',     ext: 'mp4' },
  youtube     : { pattern: /youtube\.com|youtu\.be/i,           name: 'YouTube',      ext: 'mp4' },
};

function detectPlatform(url) {
  for (const [key, val] of Object.entries(PLATFORMS)) {
    if (val.pattern.test(url)) return { key, ...val };
  }
  return { key: 'unknown', name: 'Unknown Platform', ext: 'mp4' };
}

function sanitizeFilename(name) {
  return (name || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 150);
}

/* ══════════════════════════════════════
   GET /api/social/info
   Query: { url }
   Returns: title, thumbnail, platform, formats
══════════════════════════════════════ */
const getSocialInfo = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'Please provide a valid URL starting with http.' });
    }

    const platform = detectPlatform(url);

    /* Use yt-dlp --dump-single-json to get metadata */
    let data;
    try {
      const { stdout } = await execFileAsync(
        'yt-dlp',
        [
          '--dump-single-json',
          '--no-warnings',
          '--no-check-certificates',
          '--cookies-from-browser', 'chrome',  // helps with login-gated content
          url,
        ],
        { timeout: 30_000 }
      );
      data = JSON.parse(stdout);
    } catch {
      /* Retry without cookies (public content) */
      try {
        const { stdout } = await execFileAsync(
          'yt-dlp',
          ['--dump-single-json', '--no-warnings', '--no-check-certificates', url],
          { timeout: 30_000 }
        );
        data = JSON.parse(stdout);
      } catch (err2) {
        return res.status(422).json({
          success : false,
          error   : `Could not fetch video info from ${platform.name}. The content may be private, login-required, or unavailable.`,
        });
      }
    }

    /* Build formats */
    const heightMap = { 144:'144p', 240:'240p', 360:'360p', 480:'480p', 720:'720p', 1080:'1080p' };
    const seen      = new Set();
    const formats   = [];

    (data.formats || [])
      .filter(f => f.height && f.vcodec && f.vcodec !== 'none')
      .sort((a, b) => (a.height || 0) - (b.height || 0))
      .forEach(f => {
        const label = heightMap[f.height] || `${f.height}p`;
        if (!seen.has(label)) {
          seen.add(label);
          formats.push({ quality: label, label });
        }
      });

    /* Always provide at least best/SD options */
    if (formats.length === 0) {
      formats.push(
        { quality: 'best',   label: 'Best Quality' },
        { quality: 'worst',  label: 'Low Quality'  },
      );
    }

    res.json({
      success   : true,
      platform  : platform.name,
      platformKey: platform.key,
      url,
      title     : data.title || data.description?.slice(0, 80) || 'Social Media Video',
      thumbnail : data.thumbnail || data.thumbnails?.slice(-1)[0]?.url || null,
      duration  : data.duration  || null,
      uploader  : data.uploader  || data.creator || data.channel || '',
      formats   : formats.reverse(),  // best quality first
    });
  } catch (err) {
    next(err);
  }
};

/* ══════════════════════════════════════
   GET /api/social/download
   Query: { url, quality, title, platform }
══════════════════════════════════════ */
const downloadSocial = (req, res, next) => {
  try {
    const { url, quality = 'best', title = 'video', platform = '' } = req.query;

    if (!url || !url.startsWith('http')) {
      return res.status(400).json({ success: false, error: 'Valid URL required.' });
    }

    const filename = `${sanitizeFilename(title)}.mp4`;
    const tmpFile  = path.join(os.tmpdir(), `avi_social_${Date.now()}.mp4`);

    /* Build yt-dlp format string */
    let fmtStr;
    if (quality === 'best' || quality === 'worst') {
      fmtStr = quality === 'best'
        ? 'bestvideo+bestaudio/best'
        : 'worstvideo+worstaudio/worst';
    } else {
      const h = parseInt(quality);
      fmtStr = !isNaN(h)
        ? `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`
        : 'bestvideo+bestaudio/best';
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('X-Platform', platform);

    const args = [
      '--no-check-certificates',
      '--no-warnings',
      '-f',  fmtStr,
      '--merge-output-format', 'mp4',
      '--no-playlist',
      '-o',  tmpFile,
      url,
    ];

    console.log(`[Social DL] platform=${platform} quality=${quality} url=${url.substring(0, 60)}...`);

    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let clientGone = false;

    req.on('close', () => {
      clientGone = true;
      proc.kill('SIGTERM');
      fs.unlink(tmpFile, () => {});
    });

    proc.stderr.on('data', chunk => process.stdout.write(`[yt-dlp social] ${chunk}`));

    proc.on('error', (err) => {
      if (!res.headersSent) res.status(500).json({ success: false, error: 'yt-dlp not found.' });
      fs.unlink(tmpFile, () => {});
    });

    proc.on('close', (code) => {
      if (clientGone) return;
      if (code !== 0) {
        if (!res.headersSent) res.status(500).json({ success: false, error: `Download failed (code ${code}). Content may be private.` });
        fs.unlink(tmpFile, () => {});
        return;
      }

      fs.stat(tmpFile, (statErr, stats) => {
        if (statErr || !stats || stats.size === 0) {
          if (!res.headersSent) res.status(500).json({ success: false, error: 'Download failed — file is empty.' });
          fs.unlink(tmpFile, () => {});
          return;
        }

        res.setHeader('Content-Length', stats.size);
        const stream = fs.createReadStream(tmpFile);
        stream.on('close', () => fs.unlink(tmpFile, () => {}));
        stream.on('error', () => { if (!res.headersSent) res.status(500).end(); });
        stream.pipe(res);
      });
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSocialInfo, downloadSocial };
