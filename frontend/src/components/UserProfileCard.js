import React from 'react';
import { FaBook, FaCheckCircle, FaClock, FaGraduationCap } from 'react-icons/fa';
import './UserProfileCard.css';

const UserProfileCard = ({ user }) => {
  // Datos de ejemplo (reemplazar con props reales)
  const assignedCourses = [
    {
      id: 1,
      title: "Matemáticas Básicas",
      progress: 65,
      completedLessons: 13,
      totalLessons: 20,
      lastAccessed: "2023-05-15"
    },
    {
      id: 2,
      title: "Introducción a la Programación",
      progress: 30,
      completedLessons: 6,
      totalLessons: 20,
      lastAccessed: "2023-05-10"
    },
    {
      id: 3,
      title: "Ciencias de Datos",
      progress: 15,
      completedLessons: 3,
      totalLessons: 20,
      lastAccessed: "2023-05-05"
    }
  ];

  return (
    <div className="profile-courses-card">
      <div className="courses-header">
        <FaGraduationCap className="header-icon" />
        <h3>Mis Cursos Asignados</h3>
        <span className="course-count">{assignedCourses.length} cursos</span>
      </div>

      <div className="courses-list">
        {assignedCourses.map(course => (
          <div key={course.id} className="course-item">
            <div className="course-info">
              <FaBook className="course-icon" />
              <div>
                <h4>{course.title}</h4>
                <div className="course-meta">
                  <span className="lesson-count">
                    <FaCheckCircle /> {course.completedLessons}/{course.totalLessons} lecciones
                  </span>
                  <span className="last-accessed">
                    <FaClock /> Último acceso: {course.lastAccessed}
                  </span>
                </div>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-label">
                <span>{course.progress}% completado</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${course.progress}%` }}
                  data-progress={course.progress}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="courses-footer">
        <button className="view-all-btn">Ver todos mis cursos</button>
      </div>
    </div>
  );
};

export default UserProfileCard;