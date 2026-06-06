'use strict';

/**
 * Download Controller  —  FIXED VERSION
 *
 * THE PROBLEM (why no audio was playing):
 *   yt-dlp with -o - (stdout pipe) + --merge-output-format mp4 requires
 *   ffmpeg to mux two streams in real-time. When piping to stdout,
 *   ffmpeg needs seekable output for mp4 container — stdout is NOT seekable.
 *   Result: fragmented/broken mp4 → video plays but NO AUDIO.
 *
 * THE FIX:
 *   Use a temp file approach:
 *   1. yt-dlp downloads bestvideo+bestaudio and ffmpeg merges into a temp .mp4
 *   2. We stream the finished temp file to the client
 *   3. Temp file is deleted after streaming completes
 */

const { spawn, execFile } = require('child_process');
const { promisify }       = require('util');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');
const ytdl                = require('ytdl-core');

const execFileAsync = promisify(execFile);

/* ─────────────────────────────────────────
   Quality → yt-dlp format selector
   bestvideo+bestaudio = video AND audio included
───────────────────────────────────────── */
const YTDLP_FORMAT = {
  '360p' : 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best[height<=360]/best',
  '480p' : 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]/best',
  '720p' : 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
  '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
  '2K'   : 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1440]+bestaudio/best[height<=1440]/best',
  '4K'   : 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=2160]+bestaudio/best[height<=2160]/best',
};

/* ─────────────────────────────────────────
   ytdl-core fallback — ONLY progressive streams
   itag 18 = 360p MP4 (video+audio) ✓
   itag 22 = 720p MP4 (video+audio) ✓
   DO NOT use video-only itags like 137, 248 etc.
───────────────────────────────────────── */
const YTDLCORE_QUALITY = {
  '360p' : { quality: '18' },
  '480p' : { quality: '18' },
  '720p' : { quality: '22' },
  '1080p': { quality: '22' },
  '2K'   : { quality: '22' },
  '4K'   : { quality: '22' },
};

/* ─────────────────────────────
   Helpers
───────────────────────────── */
const sanitizeFilename = (name) =>
  (name || 'video')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200);

const videoUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/* ─────────────────────────────
   GET /api/download/info
   FIXED: returns ALL video qualities (not just pre-muxed)
   because we handle audio merge server-side
───────────────────────────── */
const getVideoInfo = async (req, res, next) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });

    /* Try yt-dlp first */
    try {
      const { stdout } = await execFileAsync(
        'yt-dlp',
        ['--dump-single-json', '--no-warnings', '--no-check-certificates', videoUrl(videoId)],
        { timeout: 30_000 }
      );
      const data = JSON.parse(stdout);

      /*
       * FIXED: Old code filtered f.acodec !== 'none' — this excluded 1080p/4K
       * which are video-only streams on YouTube (audio is separate).
       * Now we collect all heights from video streams — audio is always
       * merged server-side via yt-dlp + ffmpeg.
       */
      const heightMap = { 360: '360p', 480: '480p', 720: '720p', 1080: '1080p', 1440: '2K', 2160: '4K' };
      const seen      = new Set();
      const formats   = [];

      (data.formats || [])
        .filter(f => f.height && f.vcodec && f.vcodec !== 'none')
        .sort((a, b) => (a.height || 0) - (b.height || 0))
        .forEach(f => {
          const label = heightMap[f.height] || `${f.height}p`;
          if (!seen.has(label)) {
            seen.add(label);
            const vbr   = f.vbr || f.tbr || 0;
            const abr   = 128; // standard audio bitrate
            const kbps  = vbr + abr;
            const sizeMB = data.duration && kbps
              ? ((kbps * data.duration) / 8 / 1024).toFixed(1)
              : null;
            formats.push({
              itag     : f.format_id,
              quality  : label,
              container: 'mp4',
              fps      : f.fps || null,
              size     : sizeMB ? `~${sizeMB} MB` : 'Unknown',
            });
          }
        });

      // Always ensure standard qualities appear
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
    } catch (_) { /* fall through */ }

    /* Fallback: ytdl-core */
    const info = await ytdl.getInfo(videoUrl(videoId));
    return res.json({
      success  : true,
      title    : info.videoDetails.title,
      thumbnail: info.videoDetails.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      channel  : info.videoDetails.author?.name || '',
      duration : parseInt(info.videoDetails.lengthSeconds) || null,
      views    : parseInt(info.videoDetails.viewCount) || null,
      formats  : [
        { itag: '18', quality: '360p', container: 'mp4', fps: 30, size: 'Unknown' },
        { itag: '22', quality: '720p', container: 'mp4', fps: 30, size: 'Unknown' },
      ],
      engine   : 'ytdl-core',
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────
   downloadWithYtDlp  —  CORE FIX

   ROOT CAUSE: piping to stdout (-o -) makes ffmpeg write
   to a non-seekable stream. mp4 container needs the moov
   atom at the start but ffmpeg can't seek back → audio lost.

   FIX: write to a temp file (seekable), then stream to client.
───────────────────────────────────────────────────── */
const downloadWithYtDlp = (req, res, videoId, quality, title) => {
  const fmt      = YTDLP_FORMAT[quality] || YTDLP_FORMAT['720p'];
  const filename = `${sanitizeFilename(title)}.mp4`;
  const tmpFile  = path.join(os.tmpdir(), `avi_${Date.now()}_${videoId}.mp4`);

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('X-Download-Engine', 'yt-dlp');

  const args = [
    '--no-check-certificates',
    '--no-warnings',
    '-f',  fmt,                        // bestvideo+bestaudio → WITH AUDIO
    '--merge-output-format', 'mp4',    // ffmpeg merges into proper mp4
    '--no-playlist',
    '-o',  tmpFile,                    // ← temp file (seekable) fixes audio issue
    videoUrl(videoId),
  ];

  console.log(`[yt-dlp] format : ${fmt}`);
  console.log(`[yt-dlp] tmpFile: ${tmpFile}`);

  const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  let clientGone = false;
  req.on('close', () => {
    clientGone = true;
    proc.kill('SIGTERM');
    fs.unlink(tmpFile, () => {});
  });

  proc.stderr.on('data', chunk => process.stdout.write(`[yt-dlp] ${chunk}`));

  proc.on('error', (err) => {
    console.error('[yt-dlp spawn error]', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'yt-dlp not found. Make sure it is installed.' });
    fs.unlink(tmpFile, () => {});
  });

  proc.on('close', (code) => {
    if (clientGone) return;
    if (code !== 0) {
      console.error(`[yt-dlp] exited with code ${code}`);
      if (!res.headersSent) res.status(500).json({ success: false, error: `yt-dlp failed (code ${code})` });
      fs.unlink(tmpFile, () => {});
      return;
    }

    // Stream the complete merged mp4 to client
    fs.stat(tmpFile, (statErr, stats) => {
      if (statErr || !stats || stats.size === 0) {
        console.error('[yt-dlp] temp file missing or empty');
        if (!res.headersSent) res.status(500).json({ success: false, error: 'Download failed — output file is empty.' });
        fs.unlink(tmpFile, () => {});
        return;
      }

      console.log(`[yt-dlp] Merging done → ${(stats.size / 1_048_576).toFixed(1)} MB — streaming to client`);
      res.setHeader('Content-Length', stats.size);

      const fileStream = fs.createReadStream(tmpFile);
      fileStream.on('error', err => { console.error('[stream]', err.message); if (!res.headersSent) res.status(500).end(); });
      fileStream.on('close', () => fs.unlink(tmpFile, () => console.log('[cleanup] temp file deleted')));
      fileStream.pipe(res);
    });
  });
};

/* ─────────────────────────────────────────────────────
   downloadWithYtdlCore  —  FIXED
   Only progressive streams (itag 18/22) which have audio
───────────────────────────────────────────────────── */
const downloadWithYtdlCore = async (req, res, videoId, quality, title) => {
  const opts     = YTDLCORE_QUALITY[quality] || YTDLCORE_QUALITY['720p'];
  const filename = `${sanitizeFilename(title)}.mp4`;

  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('X-Download-Engine', 'ytdl-core');

  const stream = ytdl(videoUrl(videoId), {
    ...opts,
    requestOptions: { headers: { 'User-Agent': 'Mozilla/5.0' } },
  });

  stream.on('error', (err) => {
    console.error('[ytdl-core]', err.message);
    if (!res.headersSent) res.status(500).json({ success: false, error: 'ytdl-core download failed.' });
  });

  stream.pipe(res);
  req.on('close', () => stream.destroy());
};

/* ─────────────────────────────
   Main route handler
───────────────────────────── */
const downloadVideo = async (req, res, next) => {
  try {
    const { videoId, quality = '720p', engine = 'auto', title = '' } = req.query;

    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });
    if (!YTDLP_FORMAT[quality]) {
      return res.status(400).json({
        success: false,
        error  : `Unsupported quality "${quality}". Valid: ${Object.keys(YTDLP_FORMAT).join(', ')}.`,
      });
    }

    let videoTitle = title;
    if (!videoTitle) {
      try {
        const { stdout } = await execFileAsync(
          'yt-dlp', ['--get-title', '--no-warnings', '--no-check-certificates', videoUrl(videoId)],
          { timeout: 15_000 }
        );
        videoTitle = stdout.trim();
      } catch {
        try {
          const info = await ytdl.getBasicInfo(videoUrl(videoId));
          videoTitle = info.videoDetails.title;
        } catch { videoTitle = videoId; }
      }
    }

    if (engine === 'ytdl-core') return downloadWithYtdlCore(req, res, videoId, quality, videoTitle);
    return downloadWithYtDlp(req, res, videoId, quality, videoTitle);
  } catch (err) {
    next(err);
  }
};

module.exports = { downloadVideo, getVideoInfo };
