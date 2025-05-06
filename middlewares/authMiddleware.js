const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
   const token = req.header('Authorization')?.replace('Bearer ', '');

   if (!token) {
      return res.status(401).json({ 
         success: false,
         error: 'Acceso denegado. No hay token proporcionado.' 
      });
   }

   try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Validación adicional de la estructura del usuario
      if (!decoded.grade) {
         return res.status(400).json({
            success: false,
            error: 'Token inválido: falta información de grade'
         });
      }
      
      req.user = decoded;
      next();
   } catch (err) {
      res.status(400).json({ 
         success: false,
         error: 'Token inválido.'  
      }); 
   }
};

module.exports = authMiddleware;