'use strict';
const express = require('express');
const { getSocialInfo, downloadSocial } = require('../controllers/socialController');

const router = express.Router();

router.get('/info',     getSocialInfo);   // GET /api/social/info?url=...
router.get('/download', downloadSocial);  // GET /api/social/download?url=...&quality=...&title=...

module.exports = router;
