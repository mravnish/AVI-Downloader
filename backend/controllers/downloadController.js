'use strict';

/**
 * Download Controller — FIXED FOR RENDER DEPLOYMENT
 *
 * Uses ONLY yt-dlp (not ytdl-core which gives 410 errors)
 * yt-dlp is installed via build command: npm install && pip3 install yt-dlp
 */

const { spawn, execFile } = require('child_process');
const { promisify }       = require('util');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');

const execFileAsync = promisify(execFile);

/* ── Quality → yt-dlp format ── */
const YTDLP_FORMAT = {
  '360p' : 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best[height<=360]/best',
  '480p' : 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]/best',
  '720p' : 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
  '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
  '2K'   : 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1440]+bestaudio/best[height<=1440]/best',
  '4K'   : 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
};

const sanitizeFilename = (name) =>
  (name || 'video').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, ' ').trim().substring(0, 200);

const videoUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/* Find yt-dlp binary — tries multiple paths for Render/Linux compatibility */
function getYtDlpBin() {
  const candidates = [
    'yt-dlp',
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
    `${process.env.HOME}/.local/bin/yt-dlp`,
    '/opt/render/.local/bin/yt-dlp',
  ];
  for (const bin of candidates) {
    try {
      require('child_process').execFileSync(bin, ['--version'], { timeout: 5000 });
      return bin;
    } catch {}
  }
  return 'yt-dlp'; // fallback
}

const YT_DLP = getYtDlpBin();
console.log(`[Download] yt-dlp binary: ${YT_DLP}`);

/* ══════════════════════════════════════
   GET /api/download/info?videoId=xxx
══════════════════════════════════════ */
const getVideoInfo = async (req, res, next) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });

    try {
      const { stdout } = await execFileAsync(
        YT_DLP,
        [
          '--dump-single-json',
          '--no-warnings',
          '--no-check-certificates',
          '--extractor-args', 'youtube:skip=dash',
          videoUrl(videoId),
        ],
        { timeout: 45_000 }
      );

      const data = JSON.parse(stdout);

      const heightMap = { 360:'360p', 480:'480p', 720:'720p', 1080:'1080p', 1440:'2K', 2160:'4K' };
      const seen = new Set();
      const formats = [];

      (data.formats || [])
        .filter(f => f.height && f.vcodec && f.vcodec !== 'none')
        .sort((a, b) => (a.height || 0) - (b.height || 0))
        .forEach(f => {
          const label = heightMap[f.height] || `${f.height}p`;
          if (!seen.has(label)) {
            seen.add(label);
            const vbr  = f.vbr || f.tbr || 0;
            const kbps = vbr + 128;
            const sizeMB = data.duration && kbps ? ((kbps * data.duration) / 8 / 1024).toFixed(1) : null;
            formats.push({ itag: f.format_id, quality: label, container: 'mp4', fps: f.fps || null, size: sizeMB ? `~${sizeMB} MB` : 'Unknown' });
          }
        });

      ['360p','480p','720p','1080p'].forEach(q => {
        if (!seen.has(q)) formats.push({ itag: q, quality: q, container: 'mp4', fps: null, size: 'Unknown' });
      });
      formats.sort((a, b) => parseInt(a.quality) - parseInt(b.quality));

      return res.json({
        success  : true,
        title    : data.title,
        thumbnail: data.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channel  : data.uploader || data.channel || '',
        duration : data.duration || null,
        views    : data.view_count || null,
        formats,
        engine   : 'yt-dlp',
      });
    } catch (ytErr) {
      console.error('[getVideoInfo yt-dlp error]', ytErr.message);
      // Return basic info with standard quality options
      return res.json({
        success  : true,
        title    : 'YouTube Video',
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channel  : '',
        duration : null,
        views    : null,
        formats  : ['360p','480p','720p','1080p'].map(q => ({ itag: q, quality: q, container: 'mp4', fps: null, size: 'Unknown' })),
        engine   : 'yt-dlp',
      });
    }
  } catch (err) { next(err); }
};

/* ══════════════════════════════════════
   GET /api/download/video
══════════════════════════════════════ */
const downloadVideo = async (req, res, next) => {
  try {
    const { videoId, quality = '720p', title = '' } = req.query;

    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });
    if (!YTDLP_FORMAT[quality]) return res.status(400).json({ success: false, error: `Invalid quality: ${quality}` });

    const fmt      = YTDLP_FORMAT[quality];
    const filename = `${sanitizeFilename(title || videoId)}.mp4`;
    const tmpFile  = path.join(os.tmpdir(), `avi_${Date.now()}_${videoId}.mp4`);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'video/mp4');

    const args = [
      '--no-check-certificates',
      '--no-warnings',
      '--extractor-args', 'youtube:skip=dash',
      '-f',  fmt,
      '--merge-output-format', 'mp4',
      '--no-playlist',
      '-o',  tmpFile,
      videoUrl(videoId),
    ];

    console.log(`[Download] videoId=${videoId} quality=${quality}`);

    const proc = spawn(YT_DLP, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let clientGone = false;

    req.on('close', () => { clientGone = true; proc.kill('SIGTERM'); fs.unlink(tmpFile, () => {}); });
    proc.stderr.on('data', chunk => process.stdout.write(`[yt-dlp] ${chunk}`));

    proc.on('error', (err) => {
      console.error('[yt-dlp error]', err.message);
      if (!res.headersSent) res.status(500).json({ success: false, error: 'yt-dlp not available on this server.' });
      fs.unlink(tmpFile, () => {});
    });

    proc.on('close', (code) => {
      if (clientGone) return;
      if (code !== 0) {
        console.error(`[yt-dlp] exited with code ${code}`);
        if (!res.headersSent) res.status(500).json({ success: false, error: `Download failed. Error code: ${code}` });
        fs.unlink(tmpFile, () => {});
        return;
      }

      const actualFile = fs.existsSync(tmpFile) ? tmpFile : fs.existsSync(tmpFile + '.mp4') ? tmpFile + '.mp4' : null;
      if (!actualFile) {
        if (!res.headersSent) res.status(500).json({ success: false, error: 'Output file not found after download.' });
        return;
      }

      fs.stat(actualFile, (statErr, stats) => {
        if (statErr || !stats || stats.size === 0) {
          if (!res.headersSent) res.status(500).json({ success: false, error: 'Downloaded file is empty.' });
          fs.unlink(actualFile, () => {});
          return;
        }
        console.log(`[Download] Ready: ${(stats.size / 1_048_576).toFixed(1)} MB`);
        res.setHeader('Content-Length', stats.size);
        const stream = fs.createReadStream(actualFile);
        stream.on('close', () => fs.unlink(actualFile, () => {}));
        stream.on('error', () => { if (!res.headersSent) res.status(500).end(); });
        stream.pipe(res);
      });
    });
  } catch (err) { next(err); }
};

module.exports = { downloadVideo, getVideoInfo };
