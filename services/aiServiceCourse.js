const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function generateContent(subject, grade) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `
    Como experto en educación para ${grade}, genera un plan de estudios sobre ${subject} con:
    - 5 lecciones adaptadas al nivel
    - Duración estimada
    - Objetivos de aprendizaje claros

    Formato JSON (ejemplo):
    {
      "lessons": [
        {
          "title": "Título adaptado a ${grade}",
          "description": "Objetivo:...",
          "duration": "20-30 min",
          "keywords": ["concepto1", "concepto2"]
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text().replace(/```json/g, '').replace(/```/g, '');
  return JSON.parse(text);
}

async function generateFullLesson(lessonTitle, grade, subject) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Como experto en educación para ${grade}, genera contenido sobre "${lessonTitle}" (${subject}) con:
    - 3 objetivos claros
    - Contenido detallado (mínimo 3 párrafos)
    - 2 ejemplos prácticos con título y descripción
    - 3 preguntas de autoevaluación con respuestas
    - 3 palabras clave

    Devuelve SOLO un JSON válido con esta estructura:
    {
      "objectives": ["objetivo1", "objetivo2"],
      "content": "texto completo...",
      "examples": [{"title": "...", "description": "..."}],
      "questions": [{"question": "...", "answer": "..."}],
      "keywords": ["palabra1", "palabra2"]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Limpieza del JSON
    text = text.replace(/```json|```/g, '').trim();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}') + 1;
    const jsonContent = text.substring(jsonStart, jsonEnd);

    const parsed = JSON.parse(jsonContent);

    // Validación y estructura garantizada
    return {
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      content: parsed.content || "",
      examples: Array.isArray(parsed.examples) ? parsed.examples : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      videos: [] // Se llenará después con YouTube
    };

  } catch (error) {
    console.error("Error en generateFullLesson:", error);
    // Estructura de fallback
    return {
      objectives: ["Error al generar objetivos"],
      content: "Error al generar contenido. Por favor intenta nuevamente.",
      examples: [],
      questions: [],
      keywords: []
    };
  }
}


async function getYouTubeVideos(keywords) {
  try {
    if (!keywords || keywords.length === 0) return [];

    const query = encodeURIComponent(
      `${keywords.join(' ')} educación ${grade}`
    );

    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: 'snippet',
          maxResults: 2, // Reducido para evitar timeout
          q: query,
          type: 'video',
          key: process.env.YOUTUBE_API_KEY,
          videoEmbeddable: 'true',
          safeSearch: 'strict'
        },
        timeout: 5000 // Timeout de 5 segundos
      }
    );

    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

  } catch (error) {
    console.error("Error en YouTube API:", error.message);
    return []; // Retorna array vacío para no romper el flujo
  }
}

module.exports = { generateContent, generateFullLesson, getYouTubeVideos};