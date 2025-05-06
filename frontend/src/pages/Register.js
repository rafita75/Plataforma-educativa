import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'animate.css';
import '../styles/login.css'; // Importa los estilos base del login
import '../styles/registro.css'; // Importa los estilos específicos de registro

const Register = () => {
   const navigate = useNavigate();

   const initialValues = {
      name: '',
      email: '',
      password: '',
      grade: '',
   };

   const validationSchema = Yup.object({
      name: Yup.string().required('Nombre es requerido'),
      email: Yup.string().email('Correo inválido').required('Correo es requerido'),
      password: Yup.string().min(6, 'Mínimo 6 caracteres').required('Contraseña es requerida'),
      grade: Yup.string().required('Grado es requerido'),
   });

   const onSubmit = async (values) => {
      try {
         await axios.post('http://localhost:5000/api/auth/register', values);
         navigate('/login');
      } catch (err) {
         console.log(err.response.data.error);
      }
   };

   // Opciones para el menú desplegable
   const grades = [
      'Primero de Primaria',
      'Segundo de Primaria',
      'Tercero de Primaria',
      'Cuarto de Primaria',
      'Quinto de Primaria',
      'Sexto de Primaria',
      'Primero de Secundaria',
      'Segundo de Secundaria',
      'Tercero de Secundaria',
      'Primero de Bachillerato',
      'Segundo de Bachillerato',
   ];

   return (
    <div className="login-container">
      {/* Elementos decorativos */}
      <div className="login-decoration decoration-1"></div>
      <div className="login-decoration decoration-2"></div>
      
      <div className="login-card register-card animate__animated animate__fadeIn">
        <div className="register-header">
          <h1 className="register-title">Crear Cuenta</h1>
          <p className="register-subtitle">Únete a nuestra comunidad</p>
        </div>
        
        <div className="login-body">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            <Form className="login-form">
              <div className="mb-4">
                <label className="form-label">Nombre completo</label>
                <Field 
                  name="name" 
                  type="text" 
                  className="form-control" 
                  placeholder="Tu nombre completo" 
                />
                <ErrorMessage name="name" component="div" className="error-message" />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Correo electrónico</label>
                <Field 
                  name="email" 
                  type="email" 
                  className="form-control" 
                  placeholder="tu@correo.com"  
                />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Contraseña</label> 
                <Field 
                  name="password" 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••"
                />
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>
              
              <div className="mb-4">
                <label className="form-label">Grado académico</label>
                <Field 
                  as="select" 
                  name="grade" 
                  className="form-select"
                >
                  <option value="">Selecciona tu grado</option>
                  {grades.map((grade, index) => (
                    <option key={index} value={grade}>
                      {grade}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="grade" component="div" className="error-message" />
              </div>
              
              <button 
                type="submit" 
                className="btn login-btn w-100 mt-3 animate__animated animate__bounceIn"
              >
                Registrarse
              </button>
              
              <div className="login-footer mt-4">
                <p>¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;