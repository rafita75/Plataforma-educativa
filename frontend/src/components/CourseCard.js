import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css'

const CourseCard = ({ course, onCourseDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este curso?')) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const response = await fetch(`https://edu-platform-backend-sbvg.onrender.com/api/courses/${course._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error("El servidor respondió con un formato inesperado");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar curso");
      }

      // Notificar al componente padre
      if (onCourseDeleted) {
        onCourseDeleted(course._id);
      }

    } catch (err) {
      console.error("Error completo:", err);
      setError("No se pudo eliminar el curso. Verifica la conexión o intenta más tarde.");
    } finally {
      setDeleting(false);
    }
  };


  return (
    <div className="course-card">
      {/* Encabezado con título y estado */}
      <div className="course-header">
        <h3 className="course-title">{course.subject}</h3>
        <span className={`course-status ${course.progress === 100 ? 'completed' : 'in-progress'}`}>
          {course.progress === 100 ? '✅ Completado' : '📚 En progreso'}
        </span>
      </div>
  
      {/* Mensaje de error */}
      {error && (
        <div className="course-error">
          <i className="error-icon">⚠️</i> {error}
        </div>
      )}
  
      {/* Detalles del curso */}
      <div className="course-details">
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${course.progress || 0}%` }}></div>
          <span className="progress-text">{course.progress || 0}% completado</span>
        </div>
  
        <div className="detail-row">
          <i className="detail-icon">🎓</i>
          <span className="detail-label">Grado:</span>
          <span className="detail-value">{course.grade}</span>
        </div>
  
        <div className="detail-row">
          <i className="detail-icon">📅</i>
          <span className="detail-label">Creado:</span>
          <span className="detail-value">
            {new Date(course.createdAt).toLocaleDateString('es-ES')}
          </span>
        </div>
      </div>
  
      {/* Acciones */}
      <div className="course-actions">
        <button 
          onClick={() => navigate(`/course/${course._id}`)}
          className="action-btn study-btn"
        >
          <i className="action-icon">📖</i> Estudiar
        </button>
      </div>
    </div>
  );
};

export default CourseCard;