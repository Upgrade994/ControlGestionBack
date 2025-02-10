const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { body, validationResult } = require('express-validator');

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      body('username').notEmpty().isString().trim().escape().withMessage('Username is required and must be a string'),
      body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
      body('area').notEmpty().isString().trim().escape().withMessage('Area is required and must be a string'), // Asegúrate de validar 'area'
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted
    ],
    (req, res, next) => { // Middleware para manejar los errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      controller.signup(req, res, next); // Llama al controlador signup si la validación es exitosa
    }
  );

  app.post(
    "/api/auth/signin",
    [
      body('username').notEmpty().isString().trim().escape().withMessage('Username is required'),
      body('password').notEmpty().withMessage('Password is required')
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }
      controller.signin(req, res, next);
    }
  );
};