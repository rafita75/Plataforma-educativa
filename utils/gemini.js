// En utils/gemini.js (completo)
require('dotenv').config(); // Añade esto AL INICIO del archivo
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyADAJKTumgip3aqAT6LJssBtWQGB9_qR00");

exports.generateEducationalResponse = async (prompt, grade) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", // Versión estable
    });

    const result = await model.generateContent(
      `Eres un tutor para ${grade}. Usa este formato:
    - Título en negritas
    - Puntos con guiones
    - Lenguaje simple
    
    Responde completo, detallado y claro:\n${prompt}`
    );
    const text = await result.response.text();
    
    return text.replace(/\*/g, '');
  } catch (error) {
    console.error("[ERROR Gemini]", error);
    throw new Error(`Error al generar respuesta: ${error.message}`);
  }
}; 