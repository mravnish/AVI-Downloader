'use strict';

/**
 * Audio Controller
 * Downloads MP3 audio using yt-dlp -x --audio-format mp3
 * Works for:
 *  - Single YouTube video  → GET /api/audio/single?videoId=xxx&title=xxx
 *  - Full playlist         → GET /api/audio/playlist?url=xxx&index=0  (one track at a time)
 *  - Playlist info         → GET /api/audio/playlist-info?url=xxx
 */

const { spawn, execFile } = require('child_process');
const { promisify }       = require('util');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');
const ytdl                = require('ytdl-core');

const execFileAsync = promisify(execFile);

function sanitize(name) {
  return (name || 'audio')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 150);
}

const ytUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

/* ══════════════════════════════════════
   GET /api/audio/info?videoId=xxx
   Returns title, thumbnail, duration for single video
══════════════════════════════════════ */
const getSingleAudioInfo = async (req, res, next) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });

    // Try yt-dlp first
    try {
      const { stdout } = await execFileAsync(
        'yt-dlp',
        ['--dump-single-json', '--no-warnings', '--no-check-certificates', ytUrl(videoId)],
        { timeout: 30_000 }
      );
      const d = JSON.parse(stdout);
      return res.json({
        success  : true,
        videoId,
        title    : d.title      || 'Unknown',
        channel  : d.uploader   || d.channel || '',
        thumbnail: d.thumbnail  || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration : d.duration   || null,
        views    : d.view_count || null,
        engine   : 'yt-dlp',
      });
    } catch (_) {}

    // Fallback: ytdl-core
    const info = await ytdl.getBasicInfo(ytUrl(videoId));
    return res.json({
      success  : true,
      videoId,
      title    : info.videoDetails.title,
      channel  : info.videoDetails.author?.name || '',
      thumbnail: info.videoDetails.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration : parseInt(info.videoDetails.lengthSeconds) || null,
      views    : parseInt(info.videoDetails.viewCount) || null,
      engine   : 'ytdl-core',
    });
  } catch (err) { next(err); }
};

/* ══════════════════════════════════════
   GET /api/audio/playlist-info?url=xxx
   Returns all tracks in a playlist (for audio mode)
══════════════════════════════════════ */
const getPlaylistAudioInfo = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'url is required.' });

    const { stdout } = await execFileAsync(
      'yt-dlp',
      ['--flat-playlist', '--dump-json', '--no-warnings', '--no-check-certificates', url],
      { timeout: 60_000 }
    );

    const tracks = stdout.trim().split('\n').reduce((acc, line) => {
      try {
        const v = JSON.parse(line);
        acc.push({
          videoId  : v.id,
          title    : v.title    || 'Unknown',
          channel  : v.uploader || v.channel || '',
          thumbnail: v.thumbnail || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
          duration : v.duration  || null,
          index    : v.playlist_index || acc.length + 1,
        });
      } catch {}
      return acc;
    }, []);

    let playlistTitle = 'YouTube Playlist';
    try { playlistTitle = JSON.parse(stdout.trim().split('\n')[0]).playlist_title || playlistTitle; } catch {}

    res.json({
      success : true,
      title   : playlistTitle,
      count   : tracks.length,
      tracks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch playlist. Make sure it is a valid YouTube playlist URL.' });
  }
};

/* ══════════════════════════════════════
   GET /api/audio/download?videoId=xxx&title=xxx
   Downloads single video as MP3
══════════════════════════════════════ */
const downloadAudio = (req, res, next) => {
  try {
    const { videoId, title = 'audio', quality = '320' } = req.query;
    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });

    const filename = `${sanitize(title)}.mp3`;
    const tmpFile  = path.join(os.tmpdir(), `avi_audio_${Date.now()}_${videoId}.mp3`);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Audio-Quality', quality);

    /*
     * yt-dlp flags for MP3:
     *   -x                    → extract audio only (no video)
     *   --audio-format mp3    → convert to mp3 via ffmpeg
     *   --audio-quality 0     → best quality (VBR ~320kbps)
     *   --no-playlist         → single video only
     *   -o tmpFile            → temp file (then we stream it)
     */
    const args = [
      '--no-check-certificates',
      '--no-warnings',
      '-x',
      '--audio-format',  'mp3',
      '--audio-quality', quality === '128' ? '5' : quality === '192' ? '3' : '0',  // 0=best, 5=128kbps
      '--no-playlist',
      '-o', tmpFile,
      ytUrl(videoId),
    ];

    console.log(`[Audio] Downloading MP3: ${videoId} → ${tmpFile}`);

    const proc = spawn('yt-dlp', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let clientGone = false;

    req.on('close', () => {
      clientGone = true;
      proc.kill('SIGTERM');
      fs.unlink(tmpFile, () => {});
    });

    proc.stderr.on('data', chunk => process.stdout.write(`[yt-dlp audio] ${chunk}`));

    proc.on('error', (err) => {
      console.error('[Audio] yt-dlp spawn error:', err.message);
      if (!res.headersSent) res.status(500).json({ success: false, error: 'yt-dlp not found. Make sure it is installed.' });
      fs.unlink(tmpFile, () => {});
    });

    proc.on('close', (code) => {
      if (clientGone) return;
      if (code !== 0) {
        if (!res.headersSent) res.status(500).json({ success: false, error: `Audio extraction failed (code ${code}).` });
        fs.unlink(tmpFile, () => {});
        return;
      }

      // yt-dlp may append .mp3 to the filename — find the actual output file
      const actualFile = fs.existsSync(tmpFile) ? tmpFile
        : fs.existsSync(tmpFile + '.mp3') ? tmpFile + '.mp3'
        : null;

      if (!actualFile) {
        if (!res.headersSent) res.status(500).json({ success: false, error: 'MP3 file not found after extraction.' });
        return;
      }

      fs.stat(actualFile, (statErr, stats) => {
        if (statErr || !stats || stats.size === 0) {
          if (!res.headersSent) res.status(500).json({ success: false, error: 'MP3 file is empty.' });
          fs.unlink(actualFile, () => {});
          return;
        }

        console.log(`[Audio] MP3 ready: ${(stats.size / 1_048_576).toFixed(1)} MB — streaming`);
        res.setHeader('Content-Length', stats.size);

        const stream = fs.createReadStream(actualFile);
        stream.on('close', () => fs.unlink(actualFile, () => console.log('[Audio] Temp file deleted')));
        stream.on('error', (e) => { console.error('[Audio stream]', e.message); if (!res.headersSent) res.status(500).end(); });
        stream.pipe(res);
      });
    });
  } catch (err) { next(err); }
};

module.exports = { getSingleAudioInfo, getPlaylistAudioInfo, downloadAudio };
