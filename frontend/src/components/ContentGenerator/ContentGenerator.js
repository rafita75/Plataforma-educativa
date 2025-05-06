import React, { useState } from 'react';
import axios from 'axios';
import './ContentGenerator.css';

const ContentGenerator = () => {
  const [subject, setSubject] = useState('Ciencias');
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('image');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const subjects = ['Matemáticas', 'Ciencias', 'Historia', 'Literatura'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Por favor ingresa un tema');
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setResult(null);
  
    try {
      const { data } = await axios.post('http://localhost:5000/api/content/generate', {
        subject,
        topic,
        type: contentType
      });

      console.log(data);
  
      // Asegúrate de mantener el contentType original en el resultado
      setResult({
        type: contentType, // Usamos el tipo que seleccionó el usuario
        url: data.url,
        caption: data.caption || `Contenido sobre ${topic}`,
        message: contentType === 'video' 
          ? 'Video generado con éxito' 
          : 'Imagen generada con éxito'
      });
  
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al generar el contenido');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="content-generator">
      <div className="generator-header">
        <h2 className="generator-title">Generador de Contenido Educativo</h2>
        <p className="generator-subtitle">Crea recursos didácticos personalizados en segundos</p>
      </div>
      
      <div className="generator-card">
        <form onSubmit={handleGenerate} className="generator-form">
          <div className="form-group">
            <label className="form-label">Materia</label>
            <select
              className="form-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {subjects.map((subj) => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
  
          <div className="form-group">
            <label className="form-label">Tema específico</label>
            <input
              className="form-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Fotosíntesis, Teorema de Pitágoras, Revolución Francesa..."
              required
            />
          </div>
  
          <div className="content-type-selector">
            <h4 className="type-selector-title">Tipo de contenido</h4>
            <div className="type-buttons">
              <button
                type="button"
                className={`type-btn ${contentType === 'image' ? 'active' : ''}`}
                onClick={() => setContentType('image')}
              >
                <span className="type-icon">🖼️</span>
                <span className="type-label">Imagen Educativa</span>
              </button>
              <button
                type="button"
                className={`type-btn ${contentType === 'video' ? 'active' : ''}`}
                onClick={() => setContentType('video')}
              >
                <span className="type-icon">🎥</span>
                <span className="type-label">Video Explicativo</span>
              </button>
            </div>
          </div>
  
          {error && (
            <div className="error-message">
              <i className="error-icon">⚠️</i> {error}
            </div>
          )}
  
          <button 
            type="submit" 
            className="generate-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Generando...
              </>
            ) : (
              'Generar Contenido'
            )}
          </button>
        </form>
  
        {result && (
          <div className="result-card">
            <div className="result-header">
              <h3 className="result-title">
                <span className="result-subject">{subject}</span> - {topic}
              </h3>
              <span className="result-type-badge">
                {result.type === 'image' ? 'Imagen' : 'Video'}
              </span>
            </div>
            
            <div className="media-preview">
              {result.type === 'image' ? (
                <div className="image-preview-container">
                  <img 
                    src={result.url} 
                    alt={`Contenido educativo sobre ${topic}`} 
                    className="preview-image"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'placeholder-image.jpg';
                    }}
                  />
                  <p className="image-caption">{result.caption}</p>
                  <div className="preview-actions">
                    <a 
                      href={result.url} 
                      download={`${subject}-${topic}.jpeg`}
                      className="download-btn"
                    >
                      <i className="download-icon">⬇️</i> Descargar Imagen
                    </a>
                  </div>
                </div>
              ) : (
                <div className="video-preview-container">
                  <video controls className="preview-video">
                    <source src={result.url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="video-link-btn"
                  >
                    <i className="link-icon">🔗</i> Ver Video Explicativo
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;