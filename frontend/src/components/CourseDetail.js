import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CourseDetail.css';
import Sidebar from './Sidebar';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/courses/${courseId}`);
        if (!res.ok) throw new Error("Error al cargar el curso");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const startLesson = async (lessonIndex) => {
    setLessonLoading(true);
    setError(null);
    
    try {
      console.log(`Iniciando lección ${lessonIndex} del curso ${courseId}`);
      
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/lessons/${lessonIndex}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log("Respuesta recibida, status:", response.status);
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error en respuesta:", errorData);
        throw new Error(errorData.error || `Error ${response.status} al cargar la lección`);
      }
  
      const rawData = await response.json();
      console.log("Datos crudos recibidos:", rawData);
  
      // Verificación profunda de la estructura de datos
      const isDataValid = (
        rawData &&
        typeof rawData === 'object' &&
        rawData.title !== undefined
      );
  
      if (!isDataValid) {
        console.warn("Estructura de datos inesperada:", rawData);
        throw new Error("La lección recibida tiene un formato incorrecto");
      }
  
      // Normalización de datos
      const normalizedLesson = {
        title: rawData.title || `Lección ${lessonIndex + 1}`,
        objectives: Array.isArray(rawData.objectives) ? rawData.objectives : [],
        content: rawData.content || "",
        examples: Array.isArray(rawData.examples) ? rawData.examples : [],
        questions: Array.isArray(rawData.questions) ? rawData.questions : [],
        videos: Array.isArray(rawData.videos) ? rawData.videos : [],
        lessonIndex: parseInt(lessonIndex)
      };
  
      console.log("Lección normalizada:", normalizedLesson);
      setActiveLesson(normalizedLesson);
      setError(null);
  
    } catch (error) {
      console.error("Error completo en startLesson:", error);
      
      // Estructura de fallback con más información
      setActiveLesson({
        title: `Lección ${lessonIndex + 1}`,
        objectives: [`Error: ${error.message}`],
        content: "Por favor intenta nuevamente o recarga la página",
        examples: [],
        questions: [],
        videos: [],
        lessonIndex: parseInt(lessonIndex)
      });
      
      setError(error.message);
    } finally {
      setLessonLoading(false);
    }
  };
  
  const markAsComplete = async (lessonIndex) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${courseId}/complete`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ lessonIndex })
      });
      const updatedCourse = await res.json();
      setCourse(updatedCourse);
      setActiveLesson(null);
    } catch (error) {
      setError("Error al completar lección");
    }
  };

  if (loading) return <div className="loading">Cargando curso...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!course) return <div>No se encontró el curso</div>;

  return (
    
    <div className="course-detail-container">
      
    <Sidebar />
      {activeLesson ? (
        <LessonView 
          lesson={activeLesson} 
          onBack={() => setActiveLesson(null)}
          onComplete={() => markAsComplete(activeLesson.lessonIndex)}
        />
      ) : (
        <CourseIndex 
          course={course} 
          onStartLesson={startLesson} 
          lessonLoading={lessonLoading}
        />
      )}
    </div>
  );
};

const LessonView = ({ lesson, onBack, onComplete }) => (
  <div className="lesson-view">
    <button onClick={onBack} className="back-button">
      ← Volver al índice
    </button>
    
    <h2>{lesson.title}</h2>
    
    <div className="lesson-section">
      <h3>📌 Objetivos de aprendizaje</h3>
      {lesson.objectives.length > 0 ? (
        <ul>
          {lesson.objectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      ) : (
        <p>No hay objetivos definidos para esta lección.</p>
      )}
    </div>
    
    <div className="lesson-section">
      <h3>📚 Contenido</h3>
      <div className="content-box">
        {(lesson.content || '').split('\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
    
    <div className="lesson-section">
      <h3>💡 Ejemplos prácticos</h3>
      {lesson.examples.length > 0 ? (
        <ul>
          {lesson.examples.map((example, i) => (
            <li key={i}>
              <strong>{example.title}: </strong>
              {example.description}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay ejemplos prácticos definidos para esta lección.</p>
      )}
    </div>
    
    <div className="lesson-section">
      <h3>❓ Preguntas de autoevaluación</h3>
      {lesson.questions.length > 0 ? (
        <ul>
          {lesson.questions.map((q, i) => (
            <li key={i}>
              <strong>{q.question}</strong>
              <p className="answer">{q.answer}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay preguntas de autoevaluación definidas para esta lección.</p>
      )}
    </div>
    
    <button onClick={onComplete} className="complete-btn">
      ✓ Marcar como completado
    </button>
  </div>
);

const CourseIndex = ({ course, onStartLesson, lessonLoading }) => (
  <>
    <div className="course-header">
      <h1>{course.subject} - {course.grade}</h1>
      <div className="progress-container">
        <h3>Progreso: {course.progress}%</h3>
        <div className="progress-bar">
          <div style={{ width: `${course.progress}%` }}></div>
        </div>
      </div>
    </div>

    <div className="lessons-index">
      <h2>📋 Índice de Lecciones</h2>
      {course.lessons.length > 0 ? (
        <ul>
          {course.lessons.map((lesson, index) => (
            <li key={index} className={lesson.completed ? 'completed' : ''}>
              <div className="lesson-header">
                <h3>{lesson.title}</h3>
                <span className="duration">{lesson.duration}</span>
              </div>
              <button
                onClick={() => onStartLesson(index)}
                disabled={lessonLoading}
                className="start-lesson-btn"
              >
                {lessonLoading ? 'Cargando...' : 'Empezar lección'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay lecciones disponibles</p>
      )}
    </div>
  </>
);

export default CourseDetail;