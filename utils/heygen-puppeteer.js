const axios = require('axios');

const generateVideo = async (prompt) => {
  console.log(prompt);
  try {
    // 1. Configuración según documentación oficial
    const options = {
      method: 'POST',
      url: 'https://api.heygen.com/v2/video/generate',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-key': 'YzA1ZGI2MDk3ZDc2NDc1YmEzNjg3MTZmNjM2MzRlZTgtMTc0NDQyOTY1Ng=='
      },
      data: {
        dimension: {width: 1280, height: 720},
        video_inputs: [
          {
            character: {
              type: 'avatar',
              avatar_id: 'Vanessa-invest-20220722',
              avatar_style: 'normal'
            },
            voice: {
              type: 'text',
              voice_id: '1eb233973a454f9f852ed1296874c13a',
              input_text: prompt,
              speed: 1.0
            },
            background: {
              type: 'color',
              value: '#FFFFFF'
            }
          }
        ],
        test: true
      },
      timeout: 30000
    };

    const response = await axios(options);

    console.log('Respuesta completa de la API:', response.data);
    const videoId = response.data.data?.video_id;

    return videoId;

  } catch (error) {
    console.error('Error completo:', {
      request: error.config?.data,
      response: error.response?.data,
      stack: error.stack
    });
    
    return {
      success: false,
      error: error.response?.data?.message || 
            error.message || 
            'Error desconocido al comunicarse con HeyGen',
      details: error.response?.data || null
    };
  }
};

const waitForVideoReady = async (videoId, retries = 1000, delayMs = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const options = {
            method: 'GET',
            url: 'https://api.heygen.com/v1/video_status.get',
            params: {video_id: videoId},
            headers: {
              accept: 'application/json',
              'x-api-key': 'YzA1ZGI2MDk3ZDc2NDc1YmEzNjg3MTZmNjM2MzRlZTgtMTc0NDQyOTY1Ng=='
            }
          };

        const statusRes = await axios(options);

        const status = statusRes.data?.data?.status;
        console.log(`Intento ${i + 1}: Estado del video -> ${status}`);
  
        if (status === 'completed')  
        return statusRes.data.data.video_url;;
        if (status === 'failed') throw new Error('El video falló al generarse.');
  
        await new Promise(resolve => setTimeout(resolve, delayMs)); // Espera entre intentos
      } catch (err) {
        console.error('Error al verificar estado del video:', err.response?.data || err.message);
        throw err;
      }
    }
  
    throw new Error('El video no se procesó a tiempo.');
  };
  

const shareVideo = async (videoId) => {
    try {
        const options = {
            method: 'POST',
            url: 'https://api.heygen.com/v1/video/share',
            headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'x-api-key': 'YzA1ZGI2MDk3ZDc2NDc1YmEzNjg3MTZmNjM2MzRlZTgtMTc0NDQyOTY1Ng=='
            },
            data: {video_id: videoId},
        };

        const response = await axios(options);
  
        console.log('Respuesta completa de la API:', response.data.data);
      return response.data?.data;
    } catch (error) {
      console.error('Error al compartir video:', error.response.data || error.message);
      throw error;
    }
  };
  

  exports.generateAndShareVideo = async (prompt) => {
    try {
      // 1. Generar el video
      const videoId = await generateVideo(prompt);
      if (!videoId) throw new Error('No se obtuvo video_id');

      await waitForVideoReady(videoId);
  
      console.log('Video generado con ID:', videoId);
  
      // 2. Compartir el video para obtener URL pública
      const shareUrl = await shareVideo('54582441c74642b0b8aa0324d5cbd360');
      if (!shareUrl) throw new Error('No se obtuvo URL compartida');
  
      console.log('URL compartida obtenida:', shareUrl);
  
      return {
        success: true,
        url: shareUrl,
        video_id: '54582441c74642b0b8aa0324d5cbd360',
        type: 'video'
      };
  
    } catch (error) {
      console.error('Error en generateAndShareVideo:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        details: error.response?.data || null
      };
    }
  };