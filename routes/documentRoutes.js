const express = require('express');
const { generateDocument, downloadFile } = require('../controllers/contentController');

const router = express.Router();

router.post('/generate', generateDocument);
router.get('/download/:filename', downloadFile);

module.exports = router; 