const express = require('express');
const { crearMarca, obtenerMarcas } = require('../controllers/marcaController');

const router = express.Router();

router.post('/crear', crearMarca);

router.get('/listar', obtenerMarcas);

module.exports = router;
