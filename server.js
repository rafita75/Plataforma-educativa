const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const chatbotRoutes = require("./routes/chatbotRoutes");
const contentRoutes = require('./routes/contentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://plataforma-educativa-i7ov.onrender.com'] 
    : 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.log(err));

// Rutas API
app.use('/api/auth', require('./routes/authRoutes'));
app.use("/api/chatbot", chatbotRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/downloads', express.static(path.join(__dirname, 'public', 'downloads')));

// Configuración para producción - Servir el frontend
if (process.env.NODE_ENV === 'production') {
  // 1. Servir archivos estáticos del frontend
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // 2. Manejar rutas del frontend (React Router, Vue Router, etc.)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.send('¡Backend funcionando correctamente!');
});

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));