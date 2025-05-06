import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import LearningProfile from './pages/LearningProfile';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import ContentGenerator from './components/ContentGenerator/ContentGenerator';
import DocumentGenerator from './components/DocumentGenerator';
import DarkModeToggle from './components/DarkModeToggle';
import CourseDetail from './components/CourseDetail';

const PrivateLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <DarkModeToggle />
    <main className="main-content">
      {children}
    </main>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <PrivateLayout>{children}</PrivateLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        <Route path="/questionnaire" element={
            <Questionnaire />
        } />
        
        <Route path="/learning-profile" element={
          <PrivateRoute>
            <LearningProfile />
          </PrivateRoute>
        } />

        <Route path="/chatbot" element={
          <PrivateRoute>
            <Chatbot />
          </PrivateRoute>
        } />

        <Route path="/generate" element={
          <PrivateRoute>
            <ContentGenerator />
          </PrivateRoute>
        } />

        <Route path="/generate-documents" element={
          <PrivateRoute>
            <DocumentGenerator />
          </PrivateRoute>
        } />

        <Route path="/course/:courseId" element={
          <PrivateRoute>
            <CourseDetail />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;