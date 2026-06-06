'use strict';
const express = require('express');
const { downloadVideo, getVideoInfo } = require('../controllers/downloadController');

const router = express.Router();

// GET /api/download/video?videoId=xxx&quality=720p&title=...
router.get('/video', downloadVideo);

// GET /api/download/info?videoId=xxx
router.get('/info', getVideoInfo);

module.exports = router;
