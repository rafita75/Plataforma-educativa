const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
   name: { type: String, required: true },
   email: { type: String, required: true, unique: true },
   password: { type: String, required: true },
   grade: { type: String, required: true },
   hasCompletedQuestionnaire: { type: Boolean, default: false }, // Nuevo campo
   questionnaireAnswers: { type: Array, default: [] }, // Nuevo campo
   profilePicture: { type: String, default: '' }, // Nuevo campo,
   profilePublicId: { type: String, default: '' },
   learningProfile: { // Nuevo campo para el análisis
      knowledgeLevel: { type: String, enum: ['bajo', 'medio', 'alto'] },
      learningStyle: { type: String, enum: ['visual', 'auditivo', 'kinestésico'] },
      recommendations: { type: [String], default: [] }
   },
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function (next) {
   if (!this.isModified('password')) next();
   this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('User', UserSchema);  