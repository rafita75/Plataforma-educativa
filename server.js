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
app.use(cors(
   {
      origin: 'http://localhost:3000',
      credentials: true
   }
));
app.use(express.json());


console.log('Directorio actual:', __dirname);
// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.log(err));

// Ruta de prueba
app.get('/', (req, res) => {
   res.send('¡Hola, mundo!');
});

// Rutas (solo autenticación)
app.use('/api/auth', require('./routes/authRoutes'));
app.use("/api/chatbot", chatbotRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/downloads', express.static(path.join(__dirname, 'public', 'downloads')));
app.use('/api', courseRoutes);

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));