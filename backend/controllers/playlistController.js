'use strict';

/**
 * Playlist Controller
 * Engine priority:  yt-dlp  →  ytpl (fallback)
 *
 * yt-dlp is preferred because it is actively maintained and handles
 * YouTube's frequent API changes better than ytdl-core / ytpl.
 * ytpl is used as a fallback if yt-dlp is not installed.
 */

const { execFile } = require('child_process');
const { promisify } = require('util');
const ytpl = require('ytpl');

const execFileAsync = promisify(execFile);

/* ─────────────────────────────
   Helpers
───────────────────────────── */

/** Extract playlist-id from any YouTube playlist URL. */
const extractPlaylistId = (raw) => {
  try {
    const url = new URL(raw);
    return url.searchParams.get('list') || null;
  } catch {
    // bare ID supplied directly
    if (/^PL[A-Za-z0-9_-]{10,}$/.test(raw)) return raw;
    return null;
  }
};

/** Validate that the string looks like a YouTube playlist URL or bare ID. */
const isValidPlaylistInput = (input) => {
  if (!input || typeof input !== 'string') return false;
  const s = input.trim();
  return (
    /youtube\.com\/(playlist|watch)\?.*list=[\w-]+/.test(s) ||
    /youtu\.be\/.*\?.*list=[\w-]+/.test(s) ||
    /^PL[A-Za-z0-9_-]{10,}$/.test(s)
  );
};

/** seconds → "m:ss" or "h:mm:ss" */
const fmtDuration = (secs) => {
  if (!secs || secs <= 0) return 'N/A';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
};

/** Best thumbnail from yt-dlp thumbnails array. */
const bestThumb = (thumbs, videoId) => {
  if (Array.isArray(thumbs) && thumbs.length) {
    // prefer a ~480 wide thumb
    const sorted = [...thumbs].sort((a, b) => (b.width || 0) - (a.width || 0));
    const mid = sorted.find((t) => t.width && t.width <= 640);
    return (mid || sorted[0]).url;
  }
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/* ─────────────────────────────
   Engine 1 – yt-dlp
───────────────────────────── */

const fetchWithYtDlp = async (url) => {
  const args = [
    '--flat-playlist',
    '--dump-single-json',
    '--no-warnings',
    '--no-check-certificates',   // helps in some proxy environments
    '--socket-timeout', '20',
    url,
  ];

  let stdout;
  try {
    ({ stdout } = await execFileAsync('yt-dlp', args, {
      timeout: 60_000,
      maxBuffer: 50 * 1024 * 1024, // 50 MB – large playlists
    }));
  } catch (err) {
    const msg = (err.stderr || err.message || '').toLowerCase();
    if (msg.includes('private') || msg.includes('not found') || msg.includes('unavailable')) {
      throw Object.assign(new Error('Playlist not found or is private.'), { status: 404 });
    }
    throw err; // let caller fall through to ytpl
  }

  const data = JSON.parse(stdout);

  if (!data.entries || !Array.isArray(data.entries)) {
    throw new Error('yt-dlp returned no entries.');
  }

  const videos = data.entries
    .filter((e) => e && (e.id || e.url))
    .map((e, idx) => {
      const id = e.id || (e.url || '').replace(/.*v=/, '').split('&')[0];
      return {
        id      : id,
        title   : e.title   || `Video ${idx + 1}`,
        url     : `https://www.youtube.com/watch?v=${id}`,
        thumbnail: bestThumb(e.thumbnails, id),
        duration : fmtDuration(e.duration),
        durationSec: e.duration || 0,
        author  : e.uploader || e.channel || data.uploader || 'Unknown',
        viewCount: e.view_count || 0,
        index   : idx + 1,
        available: true,
      };
    });

  return {
    id         : data.id   || extractPlaylistId(url) || '',
    title      : data.title || 'YouTube Playlist',
    author     : data.uploader || data.channel || 'Unknown',
    thumbnail  : bestThumb(data.thumbnails, ''),
    description: data.description || '',
    totalVideos: data.playlist_count || videos.length,
    videos,
    engine     : 'yt-dlp',
  };
};

/* ─────────────────────────────
   Engine 2 – ytpl (fallback)
───────────────────────────── */

const fetchWithYtpl = async (url) => {
  let result;
  try {
    result = await ytpl(url, { limit: Infinity, pages: Infinity });
  } catch (err) {
    const msg = (err.message || '').toLowerCase();
    if (msg.includes('private') || msg.includes('not found') || msg.includes('unavailable')) {
      throw Object.assign(new Error('Playlist not found or is private.'), { status: 404 });
    }
    throw err;
  }

  const videos = result.items.map((item) => ({
    id        : item.id,
    title     : item.title,
    url       : item.shortUrl,
    thumbnail : item.bestThumbnail?.url || `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`,
    duration  : fmtDuration(item.durationSec),
    durationSec: item.durationSec || 0,
    author    : item.author?.name || result.author?.name || 'Unknown',
    viewCount : 0,
    index     : item.index,
    available : !item.isLive,
  }));

  return {
    id         : result.id,
    title      : result.title,
    author     : result.author?.name || 'Unknown',
    thumbnail  : result.bestThumbnail?.url || '',
    description: result.description || '',
    totalVideos: result.estimatedItemCount || videos.length,
    videos,
    engine     : 'ytpl',
  };
};

/* ─────────────────────────────
   Controller
───────────────────────────── */

const fetchPlaylist = async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, error: 'Playlist URL is required.' });
    }

    const trimmed = url.trim();

    if (!isValidPlaylistInput(trimmed)) {
      return res.status(400).json({
        success: false,
        error  : 'Invalid YouTube playlist URL. Please paste a valid playlist link (it must contain a "list=" parameter).',
      });
    }

    let playlist;
    let ytDlpError = null;

    /* Try yt-dlp first */
    try {
      playlist = await fetchWithYtDlp(trimmed);
    } catch (err) {
      // If it's a definitive 404, propagate immediately
      if (err.status === 404) throw err;
      ytDlpError = err;
      console.warn('[playlist] yt-dlp failed, falling back to ytpl:', err.message);
    }

    /* Fallback to ytpl */
    if (!playlist) {
      try {
        playlist = await fetchWithYtpl(trimmed);
      } catch (err) {
        if (err.status === 404) throw err;
        // Both engines failed – report a combined error
        const combinedMsg =
          'Failed to fetch the playlist. ' +
          (ytDlpError ? `yt-dlp: ${ytDlpError.message}. ` : '') +
          `ytpl: ${err.message}`;
        throw new Error(combinedMsg);
      }
    }

    if (!playlist.videos || playlist.videos.length === 0) {
      return res.status(422).json({
        success: false,
        error  : 'The playlist appears to be empty or all videos are private/unavailable.',
      });
    }

    return res.json({ success: true, playlist });
  } catch (err) {
    next(err);
  }
};

module.exports = { fetchPlaylist };
