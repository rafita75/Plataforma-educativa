import React from 'react';

function ProgressBar({ total, completed }) {
  return (
    <div className="progress-tracker">
      <div className="progress-info">
        <span>Progreso Global: {completed}/{total} cursos</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${(completed/total)*100}%` }}
        ></div>
      </div>
    </div>
  );
}


export default ProgressBar;