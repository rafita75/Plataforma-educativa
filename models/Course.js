// models/Course.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: String,
  description: String,
  duration: String,
  keywords: [String],
  completed: {
    type: Boolean,
    default: false
  },
  fullContent: {
    objectives: [String],
    content: String,
    examples: [{
      title: String,
      description: String
    }],
    questions: [{
      question: String,
      answer: String
    }],
    keywords: [String],
    videos: [Object]
  }
});

const courseSchema = new mongoose.Schema({
  ip: String,
  subject: String,
  grade: String,
  lessons: {
    type: [lessonSchema],
    default: []  // 🔥 Esto es importante para evitar que sea `null`
  },
  progress: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
