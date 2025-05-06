import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './profile.css'

const LearningProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    user: {},
    analysis: {}
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    grade: '',
    profilePicture: '',
    publicId: ''
  });

  // Grados disponibles
  const gradeOptions = [
    '1ro Primaria', '2do Primaria', '3ro Primaria',
    '4to Primaria', '5to Primaria', '6to Primaria',
    '1ro Secundaria', '2do Secundaria', '3ro Secundaria',
    '4to Secundaria', '5to Secundaria'
  ];

  // Cargar datos del perfil
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/auth/learning-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfileData({
        user: response.data.userData,
        analysis: response.data.analysis
      });

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Error al cargar el perfil';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (err.response?.status === 404) {
        navigate('/questionnaire');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfileData(); }, []);

  // Subida de imagen
  /* const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('image', file); // ¡Importante: usar 'image'!
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/uploads',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log("Foto subida:", response.data.url);
      alert("Foto subida correctamente: " + response.data.url);
  
    } catch (error) {
      console.error("Error:", error.response?.data);
      alert("Error al subir: " + (error.response?.data?.error || "Revisa la consola"));
    }
  };
 */
  // Guardar cambios
  const handleSaveProfile = async () => {
    if (!editForm.name || !editForm.grade) {
      toast.error('Nombre y grado son requeridos');
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/update-profile',
        {
          name: editForm.name,
          grade: editForm.grade,
          profilePicture: editForm.profilePicture,
          publicId: editForm.publicId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfileData(prev => ({
        ...prev,
        user: response.data.updatedUser
      }));
      setIsEditing(false);
      toast.success('Perfil actualizado!');

    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="spinner-border text-primary"></div>;
  if (error && !isEditing) return (
    <div className="alert alert-danger">
      {error} <button onClick={fetchProfileData} className="btn btn-sm btn-primary">Reintentar</button>
    </div>
  );

  return (
    <div className="profile-container">
      <div className="profile-card">
        {/* Sección de perfil */}
        <div className="profile-header">
          {isEditing ? (
            <div className="profile-edit-form">
              <div className="avatar-edit-section">
                <div className="avatar-edit-container">
                  <img
                    src={editForm.profilePicture || `https://ui-avatars.com/api/?name=${editForm.name}&background=6C63FF&color=fff`}
                    alt="Perfil"
                    className="profile-avatar"
                  />
                </div>
              </div>
  
              <div className="profile-edit-fields">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    disabled={isSaving}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Grado académico</label>
                  <select
                    className="form-select"
                    value={editForm.grade}
                    onChange={(e) => setEditForm({...editForm, grade: e.target.value})}
                    disabled={isSaving}
                  >
                    <option value="">Selecciona tu grado...</option>
                    {gradeOptions.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-display">
              <div className="avatar-container">
                {profileData.user.profilePicture ? (
                  <img
                    src={profileData.user.profilePicture}
                    alt="Perfil"
                    className="profile-avatar"
                  />
                ) : (
                  <div className="avatar-initials">
                    {profileData.user.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="profile-info">
                <h2 className="profile-name">{profileData.user.name}</h2>
                <p className="profile-email">{profileData.user.email}</p>
                <span className="profile-grade">{profileData.user.grade}</span>
              </div>
            </div>
          )}
        </div>
  
        {/* Análisis de aprendizaje */}
        {!isEditing && (
          <div className="learning-analysis">
            <h3 className="analysis-title">Tu análisis de aprendizaje</h3>
            
            <div className="analysis-section">
              <div className="analysis-item">
                <span className="analysis-label">Estilo de aprendizaje predominante:</span>
                <span className="analysis-value">{profileData.analysis.learningStyle}</span>
              </div>
              
              <div className="analysis-item">
                <span className="analysis-label">Recomendaciones personalizadas:</span>
                <ul className="recommendations-list">
                  {profileData.analysis.recommendations?.map((item, i) => (
                    <li key={i} className="recommendation-item">
                      <i className="bi bi-check-circle-fill recommendation-icon"></i>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningProfile;