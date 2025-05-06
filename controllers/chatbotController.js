const geminiService = require("../utils/gemini");

exports.handleChatbotQuery = async (req, res) => {
  try {
    console.log("Request recibido:", req.body); // Log para depuración
    
    if (!req.body || !req.body.message) {
      return res.status(400).json({
        success: false,
        error: "El campo 'message' es requerido"
      });
    }

    const { message } = req.body;
    const { grade } = req.user;

    if (!grade) {
      console.warn("Usuario sin grade:", req.user);
    }

    const reply = await geminiService.generateEducationalResponse(
      message, 
      grade || "default-grade" // Valor por defecto
    );

    return res.json({
      success: true,
      data: { reply }
    });

  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 
