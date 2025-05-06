const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');

// Ruta única para ambos tipos de contenido
router.post('/generate', contentController.generateContent); 

module.exports = router; 