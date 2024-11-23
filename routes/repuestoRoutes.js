const express = require('express');
const { crearRepuesto, actualizarRepuesto, actualizarEstadoRepuesto, buscarRepuestos, repuestoIdById } = require('../controllers/repuestoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerMiddleware');  

const router = express.Router();

router.post('/', upload.single('imagen'), crearRepuesto);

router.put('/actualizar-repuesto', authMiddleware, actualizarRepuesto);

router.put('/actualizarEstado', actualizarEstadoRepuesto);

router.get('/buscar', buscarRepuestos);

router.get('/:id', repuestoIdById);

module.exports = router;
