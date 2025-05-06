const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {generateQuestions, analyzeResults} = require('../services/aiService.js');

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

// Registrar usuario
exports.register = async (req, res) => {
   const { name, email, password, grade } = req.body;
   if (!grades.includes(grade)) {
    return res.status(400).json({ error: 'Grado no válido' });
   }

   try {
      const user = new User({ name, email, password, grade });
      await user.save();
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
};

// Iniciar sesión
exports.login = async (req, res) => {
   const { email, password } = req.body;
   try {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Usuario no encontrado');

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error('Contraseña incorrecta');

      const token = jwt.sign({ id: user._id , grade: user.grade}, process.env.JWT_SECRET, { expiresIn: '24h' });
      res.json({ token });
   } catch (err) {
      res.status(400).json({ error: err.message });
   }
};  

exports.getUser = async (req, res) => {
    try {
       const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña
       if (!user) throw new Error('Usuario no encontrado');
       res.json(user);
    } catch (err) {
       res.status(400).json({ error: err.message });
    }
 };
 
exports.generateQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    
    // Cambiar esta línea para usar directamente la función importada
    const questionsData = await generateQuestions(user.grade);
     
    res.json({ questions: questionsData.questions }); // Asegurar que coincida con el formato esperado
  } catch (err) {
    console.error("Error en generateQuestions:", err);
    res.status(500).json({ error: err.message }); // Mostrar el error real
  }
};

exports.submitQuestionnaire = async (req, res) => {
   try {
     const user = await User.findById(req.user.id); 
     const analysis = await analyzeResults(req.body.answers, user.grade);
 
     user.learningProfile = analysis; // Guarda el perfil de aprendizaje
     user.hasCompletedQuestionnaire = true;
     await user.save();
 
     res.json({ analysis }); // Devuelve el análisis al frontend
   } catch (err) {
     res.status(500).json({ error: "Error al analizar respuestas" }); 
   }
 };

 exports.updateProfile = async (req, res) => {
  try {
    const { name, grade, profilePicture, publicId } = req.body;
    const userId = req.user.id; // Obtiene el ID del usuario del token JWT

    // 1. Eliminar imagen anterior de Cloudinary si se cambió
    if (req.user.profilePublicId && req.user.profilePublicId !== publicId) {
      await cloudinary.uploader.destroy(req.user.profilePublicId);
    }

    // 2. Actualizar el usuario en la base de datos
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        grade,
        profilePicture,
        profilePublicId: publicId
      },
      { new: true, select: '-password' } // Excluye la contraseña en la respuesta
    );

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      updatedUser
    });

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el perfil'
    });
  }
};

 exports.getLearningProfile = async (req, res) => {
   try {
     const user = await User.findById(req.user.id)
       .select('name email grade profilePicture learningProfile');
 
     if (!user) {
       return res.status(404).json({ error: "Usuario no encontrado" });
     }
 
     if (!user.learningProfile) {
       return res.status(400).json({ error: "Perfil de aprendizaje no disponible" });
     }
 
     res.json({
       userData: {
         name: user.name,
         email: user.email,
         grade: user.grade,
         profilePicture: user.profilePicture || ''
       },
       analysis: user.learningProfile
     });
 
   } catch (err) {
     res.status(500).json({ 
       error: "Error al obtener el perfil",
       details: err.message 
     });
   }
 };