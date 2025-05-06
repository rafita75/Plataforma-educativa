const Course = require('../models/Course');
const { generateContent, generateFullLesson, getYouTubeVideos } = require('../services/aiServiceCourse');

const jwt = require('jsonwebtoken');

exports.createCourse = async (req, res) => {
  try {
    const { subject } = req.body;

    const ip = req.ip || req.connection.remoteAddress;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userGrade = decoded.grade;

    // Verificar si el curso ya existe
    const existingCourse = await Course.findOne({
      ip,
      subject,
      grade: userGrade
    });

    if (existingCourse) {
      return res.status(400).json({
        error: "Ya tienes un curso con este tema y nivel",
        existingCourseId: existingCourse._id
      });
    }

    // Generar contenido dinámico (asegúrate de tener esta función bien hecha)
    const { lessons } = await generateContent(subject, userGrade);

    const newCourse = await Course.create({
      ip,
      subject,
      grade: userGrade,
      lessons,
      progress: 0
    });

    res.status(201).json(newCourse);

  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({
      error: "Error al crear curso",
      details: error.message
    });
  }
};


exports.getCourses = async (req, res) => {
  try {
    const ip = req.ip;
    const courses = await Course.find({ ip });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// En tu courseController.js
exports.completeLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lessonIndex } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    if (isNaN(lessonIndex) || lessonIndex < 0 || lessonIndex >= course.lessons.length) {
      return res.status(400).json({ error: 'Índice de lección inválido' });
    }

    // Marcar como completado
    course.lessons[lessonIndex].completed = true;

    // Calcular progreso
    const completedCount = course.lessons.filter(l => l.completed).length;
    course.progress = Math.round((completedCount / course.lessons.length) * 100);

    // Guardar y devolver el curso actualizado
    const updatedCourse = await course.save();
    
    if (!updatedCourse) {
      throw new Error("No se pudo actualizar el curso");
    }

    // Asegurarse de devolver el objeto completo
    res.json({
      ...updatedCourse.toObject(),
      lessons: updatedCourse.lessons || [] // Asegurar que lessons siempre sea un array
    });

  } catch (error) {
    console.error("Error en completeLesson:", error);
    res.status(500).json({ 
      error: "Error al completar lección",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.startLesson = async (req, res) => {
  try {
    const { courseId, lessonIndex } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Curso no encontrado" });

    const index = parseInt(lessonIndex);
    if (isNaN(index) || index < 0 || index >= course.lessons.length) {
      return res.status(400).json({ error: "Índice inválido" });
    }

    const lesson = course.lessons[index];
    
    // Cambia esta condición para verificar si el fullContent está vacío
    if (!lesson.fullContent || 
        (Array.isArray(lesson.fullContent.objectives) && lesson.fullContent.objectives.length === 0) ||
        !lesson.fullContent.content) {
      
      console.log("Generando nuevo contenido...");
      const fullContent = await generateFullLesson(
        lesson.title,
        course.grade,
        course.subject
      );

      // Asignación segura con los nuevos datos
      lesson.fullContent = {
        objectives: fullContent.objectives || [],
        content: fullContent.content || "",
        examples: fullContent.examples || [],
        questions: fullContent.questions || [],
        keywords: fullContent.keywords || lesson.keywords || [], // Mantiene los existentes si no hay nuevos
        videos: fullContent.videos || []
      };

      await course.save();
    }

    // Estructura de respuesta garantizada
    res.json({
      title: lesson.title,
      objectives: lesson.fullContent.objectives,
      content: lesson.fullContent.content,
      examples: lesson.fullContent.examples,
      questions: lesson.fullContent.questions,
      videos: lesson.fullContent.videos,
      lessonIndex: index
    });

  } catch (error) {
    console.error('Error en startLesson:', error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID de curso inválido' });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    
    if (!deletedCourse) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.json({ 
      success: true,
      message: 'Curso eliminado correctamente',
      courseId: id
    });

  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};