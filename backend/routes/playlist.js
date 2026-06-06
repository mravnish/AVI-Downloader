'use strict';
const express = require('express');
const { fetchPlaylist } = require('../controllers/playlistController');

const router = express.Router();

// POST /api/playlist/fetch  { url: "https://youtube.com/playlist?list=..." }
router.post('/fetch', fetchPlaylist);

module.exports = router;
