import React, { useState } from 'react';
import axios from 'axios';
import './DocumentGenerator.css';

const ContentGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState('pdf');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('https://edu-platform-backend-sbvg.onrender.com/api/documents/generate', { prompt, format });
      setDownloadUrl(response.data.downloadUrl);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-generator">
      <div className="generator-header">
        <h2 className="generator-title">Generador de Contenido Educativo</h2>
        <p className="generator-subtitle">Crea recursos didácticos personalizados con IA</p>
      </div>
      
      <div className="generator-card">
        <form onSubmit={handleSubmit} className="generator-form">
          <div className="form-group">
            <label className="form-label">Prompt</label>
            <textarea
              className="form-textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Explica el teorema de Pitágoras para estudiantes de secundaria..."
              required
              rows="5"
            />
          </div>
  
          <div className="format-selector">
            <h4 className="format-title">Formato de salida</h4>
            <div className="format-buttons">
              <button
                type="button"
                className={`format-btn ${format === 'pdf' ? 'active' : ''}`}
                onClick={() => setFormat('pdf')}
              >
                <span className="format-icon">📄</span>
                <span className="format-label">Documento PDF</span>
              </button>
              <button
                type="button"
                className={`format-btn ${format === 'presentation' ? 'active' : ''}`}
                onClick={() => setFormat('presentation')}
              >
                <span className="format-icon">🖥️</span>
                <span className="format-label">Presentación</span>
              </button>
            </div>
          </div>
  
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
  
        {downloadUrl && (
          <div className="result-card">
            <div className="download-section">
              <a 
                href={`http://localhost:5000${downloadUrl}`} 
                download 
                target="_blank" 
                rel="noopener noreferrer"
                className="download-btn"
              >
                <i className="download-icon">⬇️</i> Descargar {format === 'pdf' ? 'Documento PDF' : 'Presentación'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentGenerator;