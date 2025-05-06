const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rutas protegidas
router.post(
  "/query",
  authMiddleware, // Verifica JWT y añade req.user
  chatbotController.handleChatbotQuery
);

module.exports = router;