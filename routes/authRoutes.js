const express = require('express');
const { register, login, actualizarContrasena, actualizarDatosPersonales, obtenerPersonaPorIdUsuario } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

router.put('/actualizar-contrasena', authMiddleware, actualizarContrasena);

router.put('/actualizar-datos-personales', authMiddleware, actualizarDatosPersonales);

router.get('/persona/:idusuario', authMiddleware, obtenerPersonaPorIdUsuario);

module.exports = router;
