const express = require('express');
const { crearModelo, obtenerModelosPorMarca } = require('../controllers/modeloController');

const router = express.Router();

router.post('/', crearModelo);

router.get('/marca/:idmarca', obtenerModelosPorMarca);

module.exports = router;
