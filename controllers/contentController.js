const { generateImage } = require('../utils/stabilityAI');
const { generateAndShareVideo  } = require('../utils/heygen-puppeteer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createContentWithWebhook } = require('../utils/PredisService');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// En tu controlador (modificado)
exports.generateContent = async (req, res) => {
  const { subject, topic, type } = req.body;

  try {
    const prompt = type === 'image' 
      ? `Crea una imagen creativa y explicativa sobre ${subject} - ${topic}`
      : `Crea un video explicativo de ${subject} sobre ${topic}`;

    const response = await createContentWithWebhook(
      'ozysesYkF0meompSHvdBZnp3Y6cATElH',
      '6806ccaf794ac7d6953f4bb1',
      prompt,
      'https://webhook.site/6d2a5637-b635-45a1-9d84-80a0a0dbbd72',
      type === 'image' ? 'single_image' : 'video',
      'long'
    );

    // Asegúrate de que la respuesta incluya el tipo de contenido
    res.json({
      success: true,
      type, // 'image' o 'video'
      url: response.url || response.imageUrl || response.videoUrl,
      caption: `Imagen educativa sobre ${topic}`,
      // cualquier otro dato necesario
    });
  } catch (error) {
    console.error("Error en generateContent:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al generar el contenido"
    });
  }
};

const { generatePDF } = require('../utils/pdfService');
const { generatePresentation } = require('../utils/pptxService');
const path = require('path');
const fs = require('fs');

exports.generateDocument = async (req, res) => {
  try {
    const { prompt, format } = req.body;

    if (!['pdf', 'presentation'].includes(format)) {
      return res.status(400).json({ error: 'Formato no válido. Use "pdf" o "presentation".' });
    }

    let result;
    if (format === 'pdf') {
      result = await generatePDF(prompt);
    } else {
      result = await generatePresentation(prompt);
    }

    res.json({
      success: true,
      downloadUrl: result.downloadUrl
    });

  } catch (error) {
    console.error('Error en generateContent:', error);
    res.status(500).json({ error: 'Error al generar el contenido' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../frontend/public/downloads', filename); // Ruta corregida

      console.log('Buscando archivo en:', filePath); // Para debug

      if (!fs.existsSync(filePath)) {
          console.error('Archivo no encontrado:', filename);
          return res.status(404).json({ error: 'Archivo no encontrado' });
      }

      res.download(filePath, filename, (err) => {
          if (err) {
              console.error('Error al descargar:', err);
              res.status(500).json({ error: 'Error al enviar el archivo' });
          }
      });

  } catch (error) {
      console.error('Error en downloadFile:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
};