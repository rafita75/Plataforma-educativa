import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import './Chatbot.css'; // Estilos (crear archivo nuevo)

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "¡Hola! Soy tu tutor virtual. ¿En qué necesitas ayuda?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = { text: inputValue, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No estás autenticado');
  
      const response = await axios.post(
        'https://edu-platform-backend-sbvg.onrender.com/api/chatbot/query',
        { message: inputValue },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos de timeout
        }
      );
  
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error en la respuesta del servidor');
      }
  
      setMessages(prev => [...prev, { 
        text: response.data.data.reply, 
        sender: "bot" 
      }]);
    } catch (error) {
      console.error("Error completo:", error);
      
      let errorMessage = "Ocurrió un error al procesar tu mensaje";
      if (error.response) {
        errorMessage = error.response.data?.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      setMessages(prev => [...prev, { 
        text: `⚠️ ${errorMessage}`, 
        sender: "bot" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='chatbot-main'>
      <div className="chatbot-wrapper">
        <div className="chatbot-container">
          {/* Encabezado del chatbot */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <FaRobot className="chatbot-icon" />
              <h3 className="chatbot-title">Tutor Virtual</h3>
              <span className="chatbot-status">En línea</span>
            </div>
          </div>
  
          {/* Área de mensajes */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}-message`}>
                <div className="message-avatar">
                  {msg.sender === 'user' ? (
                    <FaUser className="user-avatar" />
                  ) : (
                    <FaRobot className="bot-avatar" />
                  )}
                </div>
                <div className="message-bubble">
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-message bot-message">
                <div className="message-avatar">
                  <FaRobot className="bot-avatar" />
                </div>
                <div className="message-bubble">
                  <div className="message-text typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
  
          {/* Área de entrada */}
          <div className="chatbot-input-area">
            <div className="input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu pregunta..."
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                className="chatbot-input"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !inputValue.trim()}
                className="send-button"
              >
                <FaPaperPlane className="send-icon" />
              </button>
            </div>
            <p className="input-hint">Presiona Enter para enviar</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;