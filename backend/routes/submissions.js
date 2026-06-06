'use strict';
const express = require('express');
const {
  submitContact, submitBug,
  getSubmissions, updateStatus, deleteSubmission,
} = require('../controllers/submissionsController');

const router = express.Router();

router.post  ('/',           submitContact);    // POST /api/submissions/contact  ← used by Contact page
router.post  ('/contact',    submitContact);    // alias
router.post  ('/bug',        submitBug);        // POST /api/submissions/bug
router.get   ('/',           getSubmissions);   // GET  /api/submissions?type=&status=
router.patch ('/:id/status', updateStatus);     // PATCH /api/submissions/:id/status
router.delete('/:id',        deleteSubmission); // DELETE /api/submissions/:id

module.exports = router;
