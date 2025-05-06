const express = require('express');
const { register, login, getUser, generateQuestions, submitQuestionnaire, getLearningProfile, updateProfile} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/register', register);
router.post('/login', login);


router.get('/user', authMiddleware, getUser); 

router.get('/generate-questions', authMiddleware, generateQuestions); 
router.post('/submit-questionnaire', authMiddleware, submitQuestionnaire);

router.get('/learning-profile', authMiddleware, getLearningProfile);


module.exports = router;   