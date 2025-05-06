// Importamos los módulos necesarios
const axios = require('axios');
const FormData = require('form-data');
const { Buffer } = require('buffer');

exports.generateImage = async (prompt) => {
  try {
    // 1. Configuramos el payload como en la documentación
    const payload = {
      prompt: `${prompt}. Estilo educativo, colores vibrantes, sin texto`,
      output_format: 'png',
      model: 'sd3.5-large'
    };

    // 2. Creamos el FormData manualmente
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // 3. Hacemos la petición POST
    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          'Accept': 'image/*'
        },
        responseType: 'arraybuffer' // Para recibir la imagen como buffer
      }
    );

    // 4. Convertimos a base64 para el frontend
    const base64Image = Buffer.from(response.data).toString('base64');
    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error('Error en Stability AI:', {
      status: error.response?.status,
      data: error.response?.data?.toString(),
    });
    throw new Error(error.response?.data?.toString() || 'Error al generar la imagen');
  }
};