'use strict';

const { spawn, execFile } = require('child_process');
const { promisify }       = require('util');
const fs                  = require('fs');
const os                  = require('os');
const path                = require('path');

const execFileAsync = promisify(execFile);

function sanitize(name) {
  return (name || 'audio').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').trim().substring(0, 150);
}

const ytUrl = (id) => `https://www.youtube.com/watch?v=${id}`;

function getYtDlpBin() {
  const candidates = ['yt-dlp','/usr/local/bin/yt-dlp','/usr/bin/yt-dlp',`${process.env.HOME}/.local/bin/yt-dlp`,'/opt/render/.local/bin/yt-dlp'];
  for (const bin of candidates) {
    try { require('child_process').execFileSync(bin, ['--version'], { timeout: 5000 }); return bin; } catch {}
  }
  return 'yt-dlp';
}
const YT_DLP = getYtDlpBin();

/* GET /api/audio/info */
const getSingleAudioInfo = async (req, res, next) => {
  try {
    const { videoId } = req.query;
    if (!videoId) return res.status(400).json({ success: false, error: 'videoId is required.' });
    try {
      const { stdout } = await execFileAsync(YT_DLP,
        ['--dump-single-json','--no-warnings','--no-check-certificates','--extractor-args','youtube:player_client=android,web;skip=dash','--user-agent','com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip', ytUrl(videoId)],
        { timeout: 30_000 });
      const d = JSON.parse(stdout);
      return res.json({ success:true, videoId, title:d.title||'Unknown', channel:d.uploader||d.channel||'', thumbnail:d.thumbnail||`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, duration:d.duration||null, views:d.view_count||null, engine:'yt-dlp' });
    } catch {
      return res.json({ success:true, videoId, title:'YouTube Video', channel:'', thumbnail:`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, duration:null, views:null, engine:'yt-dlp' });
    }
  } catch (err) { next(err); }
};

/* GET /api/audio/playlist-info */
const getPlaylistAudioInfo = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ success: false, error: 'url is required.' });
    const { stdout } = await execFileAsync(YT_DLP,
      ['--flat-playlist','--dump-json','--no-warnings','--no-check-certificates', url],
      { timeout: 60_000 });
    const tracks = stdout.trim().split('\n').reduce((acc, line) => {
      try { const v = JSON.parse(line); acc.push({ videoId:v.id, title:v.title||'Unknown', channel:v.uploader||v.channel||'', thumbnail:v.thumbnail||`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, duration:v.duration||null, index:v.playlist_index||acc.length+1 }); } catch {}
      return acc;
    }, []);
    let playlistTitle = 'YouTube Playlist';
    try { playlistTitle = JSON.parse(stdout.trim().split('\n')[0]).playlist_title || playlistTitle; } catch {}
    res.json({ success:true, title:playlistTitle, count:tracks.length, tracks });
  } catch (err) {
    res.status(500).json({ success:false, error:'Failed to fetch playlist.' });
  }
};

/* GET /api/audio/download */
const downloadAudio = (req, res, next) => {
  try {
    const { videoId, title='audio', quality='320' } = req.query;
    if (!videoId) return res.status(400).json({ success:false, error:'videoId is required.' });

    const filename = `${sanitize(title)}.mp3`;
    const tmpBase  = path.join(os.tmpdir(), `avi_audio_${Date.now()}_${videoId}`);
    const tmpFile  = `${tmpBase}.mp3`;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'audio/mpeg');

    const args = [
      '--no-check-certificates','--no-warnings',
      '--extractor-args','youtube:player_client=android,web;skip=dash','--user-agent','com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
      '-x','--audio-format','mp3',
      '--audio-quality', quality==='128'?'5':quality==='192'?'3':'0',
      '--no-playlist','-o', tmpBase + '.%(ext)s',
      ytUrl(videoId),
    ];

    const proc = spawn(YT_DLP, args, { stdio:['ignore','pipe','pipe'] });
    let clientGone = false;
    req.on('close', () => { clientGone=true; proc.kill('SIGTERM'); fs.unlink(tmpFile,()=>{}); });
    proc.stderr.on('data', chunk => process.stdout.write(`[audio] ${chunk}`));
    proc.on('error', err => { if(!res.headersSent) res.status(500).json({success:false,error:'yt-dlp not available.'}); });
    proc.on('close', code => {
      if (clientGone) return;
      if (code!==0) { if(!res.headersSent) res.status(500).json({success:false,error:`Audio extraction failed (${code}).`}); return; }
      const f = fs.existsSync(tmpFile) ? tmpFile : null;
      if (!f) { if(!res.headersSent) res.status(500).json({success:false,error:'MP3 file not found.'}); return; }
      fs.stat(f, (e,s) => {
        if (e||!s||s.size===0) { if(!res.headersSent) res.status(500).json({success:false,error:'MP3 file is empty.'}); fs.unlink(f,()=>{}); return; }
        res.setHeader('Content-Length', s.size);
        const stream = fs.createReadStream(f);
        stream.on('close', () => fs.unlink(f,()=>{}));
        stream.pipe(res);
      });
    });
  } catch (err) { next(err); }
};

module.exports = { getSingleAudioInfo, getPlaylistAudioInfo, downloadAudio };
