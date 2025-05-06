import { useState, useEffect } from 'react';
import AddCourseButton from '../components/AddCourseButton';
import CourseCard from '../components/CourseCard';
import UserProfileCard from '../components/UserProfileCard'
import '../styles/globals.css';
import '../styles/animations.css';


function Dashboard() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  // Función para manejar la eliminación
  const handleCourseDeleted = (deletedCourseId) => {
    setCourses(prevCourses => prevCourses.filter(course => course._id !== deletedCourseId));
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
         <h1>Dashboard</h1>
      </header>
      <AddCourseButton onCourseCreated={(newCourse) => 
        setCourses([...courses, newCourse])} 
      />
      
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {courses.map(course => (
        <CourseCard 
          key={course._id} 
          course={course} 
          onCourseDeleted={handleCourseDeleted} 
        />
      ))}
    </div>
    </div>
  );
}

export default Dashboard;