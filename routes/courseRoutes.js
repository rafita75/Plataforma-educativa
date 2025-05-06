const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const authMiddleware = require('../middlewares/authMiddleware'); // Opcional para JWT

// Crear curso (con grado del JWT)
router.post('/', authMiddleware, courseController.createCourse); 

// Obtener cursos por IP (sin auth)
router.get('/', courseController.getCourses);

// Detalles de curso + lecciones 
router.get('/:id', courseController.getCourseById);

// Marcar lección como completada
router.patch('/:courseId/complete', authMiddleware, courseController.completeLesson);

// Nueva ruta para generar lección (con YouTube)
router.post('/:courseId/lessons/:lessonIndex', courseController.startLesson);


module.exports = router;