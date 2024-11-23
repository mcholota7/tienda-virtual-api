const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const inventarioController = require('../controllers/inventarioController');


router.get('/listar', authMiddleware, inventarioController.listarInventario);

module.exports = router;
