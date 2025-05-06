import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const Login = () => {
   const navigate = useNavigate();

   const initialValues = {
      email: '',
      password: '',
   };

   const validationSchema = Yup.object({
      email: Yup.string().email('Correo inválido').required('Correo es requerido'),
      password: Yup.string().required('Contraseña es requerida'),
   });

   const onSubmit = async (values) => {
      try {
         const response = await axios.post('https://edu-platform-backend-sbvg.onrender.com/api/auth/login', values);
         localStorage.setItem('token', response.data.token);
   
         // Verificar si es el primer inicio de sesión
         const userResponse = await axios.get('https://edu-platform-backend-sbvg.onrender.com/api/auth/user', {
            headers: {
               Authorization: `Bearer ${response.data.token}`,
            },
         });
   
         if (userResponse.data.hasCompletedQuestionnaire === false) {
            navigate('/questionnaire'); // Redirigir al cuestionario
         } else {
            navigate('/dashboard'); // Redirigir al dashboard
         }
      } catch (err) { 
         console.log(err.response.data.error);
      }
   };
 
   return (
      <div className="login-container">
        {/* Elementos decorativos */}
        <div className="login-decoration decoration-1"></div>
        <div className="login-decoration decoration-2"></div>
        
        <div className="login-card animate__animated animate__fadeIn">
          <div className="login-header">
            <h1 className="login-title">Bienvenido</h1>
            <p className="login-subtitle">Inicia sesión para continuar</p>
          </div>
          
          <div className="login-body">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="login-form">
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
                  
                  <button 
                    type="submit" 
                    className="btn login-btn w-100 mt-4 animate__animated animate__bounceIn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Iniciando...' : 'Iniciar Sesión'}
                  </button>
                  
                  <div className="login-footer mt-4">
                    <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    );
};

export default Login;