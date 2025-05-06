const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configura tu API Key (obtén una en https://aistudio.google.com/)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.generateQuestions = async (grade) => {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro", // Modelo rápido y gratuito
  });

  const prompt = `
    Genera un cuestionario de 5 preguntas para ${grade} sobre:
    - Matemáticas
    - Lenguaje
    - Habilidades cognitivas

    Formato JSON estricto (solo texto, sin markdown):
    {
      "questions": [
        {
          "text": "pregunta",
          "options": ["op1", "op2", "op3", "op4"],
          "correctAnswer": "op1"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Gemini puede devolver texto con ```json, lo limpiamos
    const cleanJson = text.replace(/```json|```/g, '');
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Error con Gemini:", err);
    throw new Error("Error al generar preguntas");
  }
};

exports.analyzeResults = async (answers, grade) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json" // Forzamos respuesta JSON
      }
    });

    const prompt = `
      Eres un tutor educativo. Analiza estas respuestas de ${grade}:
      ${JSON.stringify(answers, null, 2)}

      Devuelve EXCLUSIVAMENTE un JSON con:
      {
        "knowledgeLevel": "bajo/medio/alto",
        "learningStyle": "visual/auditivo/kinestésico",
        "recommendations": ["ejemplo1", "ejemplo2"] (mínimo 3)
      }

      Normas:
      1. Nivel de conocimiento: basado en % de respuestas correctas
      2. Estilo de aprendizaje: inferirlo de los tipos de errores
      3. Recomendaciones: específicas para el nivel detectado
    `;

    // Versión más robusta del manejo de respuesta
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Limpieza avanzada de la respuesta
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1; 
    const jsonString = text.slice(jsonStart, jsonEnd);

    const analysis = JSON.parse(jsonString);
    
    // Validación básica
    if (!analysis.knowledgeLevel || !analysis.recommendations) {
      throw new Error("Formato de análisis inválido");
    }

    return analysis;

  } catch (err) {
    console.error("Error en analyzeResults:", err);
    
    // Respuesta de respaldo
    return {
      knowledgeLevel: "medio",
      learningStyle: "visual",
      recommendations: [
        "Practicar con ejercicios interactivos",
        "Usar diagramas para estudiar",
        "Realizar resúmenes visuales"
      ]
    };
  }
};