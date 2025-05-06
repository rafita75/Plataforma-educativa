import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'animate.css';
import '../styles/questionnaire.css';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('https://edu-platform-backend-sbvg.onrender.com/api/auth/generate-questions', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
       

      if (!response.data?.questions) {
        throw new Error('Formato de respuesta inválido');
      }

      setQuestions(response.data.questions);
    } catch (err) {
      console.error('Error al generar preguntas:', err);
      setError(err.response?.data?.error || err.message);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuestionnaire();
    }
  };

  const submitQuestionnaire = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://edu-platform-backend-sbvg.onrender.com/api/auth/submit-questionnaire', 
        { answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      navigate('/learning-profile');
    } catch (err) {
      console.error('Error al enviar respuestas:', err);
      setError('Error al guardar tus respuestas. Intenta nuevamente.');
    }
  };

  useEffect(() => {
    generateQuestions();
  }, []);

  return (
    <div className="questionnaire-container-full animate__animated animate__fadeIn">
      <div className="row justify-content-center h-100">
        <div className="col-12 h-100">
          {isLoading ? (
            <div className="loading-screen-full text-center d-flex flex-column justify-content-center align-items-center">
              <div className="spinner-grow text-primary" style={{ width: '5rem', height: '5rem' }} role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <h2 className="mt-4 text-primary">Generando tu cuestionario personalizado...</h2>
              <p className="text-muted mt-2 fs-5">Estamos preparando preguntas adaptadas a tus necesidades</p>
            </div>
          ) : error ? (
            <div className="error-card-full d-flex justify-content-center align-items-center">
              <div className="alert-card-full">
                <div className="alert-icon">
                  <i className="bi bi-exclamation-triangle-fill"></i>
                </div>
                <div className="alert-content">
                  <h2>Ocurrió un error</h2>
                  <p className="fs-5">{error}</p>
                  <button 
                    className="btn btn-retry-lg"
                    onClick={generateQuestions}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Reintentar
                  </button>
                </div>
              </div>
            </div>
          ) : questions.length > 0 ? (
            <div className="quiz-card-full animate__animated animate__fadeInUp h-100">
              <div className="card-body-full d-flex flex-column h-100">
                <div className="quiz-header-full text-center mb-4">
                  <h1 className="quiz-title-full display-4">Cuestionario Inicial</h1>
                  <p className="quiz-subtitle-full fs-4">Responde honestamente para mejores resultados</p>
                </div>
                
                <div className="progress-container-full mb-4 px-5">
                  <div className="progress-info-full d-flex justify-content-between mb-3 fs-5">
                    <span>Progreso</span>
                    <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                  </div>
                  <div className="progress-full" style={{ height: '12px' }}>
                    <div 
                      className="progress-bar-full"
                      role="progressbar"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                      aria-valuenow={currentQuestion + 1}
                      aria-valuemin="0"
                      aria-valuemax={questions.length}
                    ></div>
                  </div>
                </div>
  
                <div className="question-content-full flex-grow-1 d-flex flex-column justify-content-center">
                  <div className="question-text-full mb-5 px-3">
                    <h2 className="display-6">{questions[currentQuestion].text}</h2>
                  </div>
                  <div className="options-grid-full px-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        className="option-btn-full animate__animated animate__fadeIn"
                        onClick={() => handleAnswer(option)}
                        style={{ '--option-index': index }}
                      >
                        <span className="option-text">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state-full d-flex justify-content-center align-items-center">
              <div className="alert-card-full">
                <div className="alert-icon">
                  <i className="bi bi-info-circle-fill"></i>
                </div>
                <div className="alert-content">
                  <h2>No hay preguntas disponibles</h2>
                  <button 
                    className="btn btn-retry-lg"
                    onClick={generateQuestions}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Intentar nuevamente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;