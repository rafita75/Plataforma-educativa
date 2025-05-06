// components/AddCourseButton.js

import React, { useState } from 'react';
import './AddCourseButton.css'

const AddCourseButton = ({ onCourseCreated }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateCourse = async (subject) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión primero');
        return;
      }

      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el curso');
      }

      const newCourse = await response.json();
      onCourseCreated(newCourse);
      alert(`Curso de ${subject} creado para tu grado!`);
    } catch (error) {
      alert(error.message);
      console.error("Detalles del error:", error);
    }
  };

  return (
    <div className="course-creator-container">
      <button 
        className={`course-creator-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
        Nuevo Curso
      </button>
  
      {isOpen && (
        <div className="subject-selector">
          {['Matemáticas', 'Ciencias', 'Lenguaje', 'Idioma'].map((subject) => (
            <button
              key={subject}
              className="subject-button"
              onClick={() => handleCreateCourse(subject)}
            >
              <span className="subject-icon">
                {subject === 'Matemáticas' && '🧮'}
                {subject === 'Ciencias' && '🔬'}
                {subject === 'Lenguaje' && '📚'}
                {subject === 'Idioma' && '📚'}
              </span>
              {subject}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddCourseButton;
