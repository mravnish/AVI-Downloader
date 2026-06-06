'use strict';
const express = require('express');
const {
  getStats, getUsers, deleteUser, toggleRole, trackDownload,
} = require('../controllers/adminController');

const router = express.Router();

router.get   ('/stats',             getStats);       // GET  /api/admin/stats
router.get   ('/users',             getUsers);       // GET  /api/admin/users
router.delete('/users/:id',         deleteUser);     // DEL  /api/admin/users/:id
router.patch ('/users/:id/role',    toggleRole);     // PATCH /api/admin/users/:id/role
router.post  ('/track',             trackDownload);  // POST /api/admin/track (internal)

module.exports = router;
