'use strict';
const express = require('express');
const { getSingleAudioInfo, getPlaylistAudioInfo, downloadAudio } = require('../controllers/audioController');

const router = express.Router();

router.get('/info',          getSingleAudioInfo);    // GET /api/audio/info?videoId=xxx
router.get('/playlist-info', getPlaylistAudioInfo);  // GET /api/audio/playlist-info?url=xxx
router.get('/download',      downloadAudio);         // GET /api/audio/download?videoId=xxx&title=xxx&quality=320

module.exports = router;
