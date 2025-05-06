import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaUser, FaRobot, FaSignOutAlt, 
  FaImage, FaFilePdf, FaBars, FaTimes 
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Detección automática de dispositivo y cierre en móvil
  useEffect(() => {
    const checkMobile = () => {
      const mobileCheck = window.innerWidth < 1024;
      setIsMobile(mobileCheck);
      if (mobileCheck) setIsExpanded(false);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  // Items de navegación con detección de ruta activa
  const navItems = [
    { path: '/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { path: '/learning-profile', icon: <FaUser />, text: 'Perfil' },
    { path: '/chatbot', icon: <FaRobot />, text: 'ChatBot IA' },
    { path: '/generate', icon: <FaImage />, text: 'Generar Contenido' },
    { path: '/generate-documents', icon: <FaFilePdf />, text: 'Documentos' }
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && isExpanded && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Botón flotante para móvil */}
      {isMobile && (
        <button 
          className="mobile-sidebar-toggle"
          onClick={toggleSidebar}
        >
          {isExpanded ? <FaTimes /> : <FaBars />}
        </button>
      )}

      <div 
        className={`sidebar ${isExpanded ? 'expanded' : ''} ${isMobile ? 'mobile' : ''}`}
        onMouseEnter={!isMobile ? () => setIsExpanded(true) : undefined}
        onMouseLeave={!isMobile ? () => setIsExpanded(false) : undefined}
      >
        <div className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}x
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={isMobile ? toggleSidebar : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.text}</span>
            </Link>
          ))}

          <div className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FaSignOutAlt /></span>
            <span className="nav-text">Cerrar Sesión</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;