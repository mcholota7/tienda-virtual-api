const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/crear',  authMiddleware, pedidoController.crearPedido);

router.put('/actualizar-estado', authMiddleware, pedidoController.actualizarEstadoPedido);

router.get('/mis-pedidos', authMiddleware, pedidoController.verMisPedidos);

router.get('/mis-pedidos-anteriores', authMiddleware, pedidoController.verMisPedidosAnteriores);

router.get('/detalle/:idpedido', authMiddleware, pedidoController.obtenerDetallePedido);

router.get('/ordenes-filtradas', authMiddleware, pedidoController.obtenerOrdenesPorEstado);

router.get('/reporte', authMiddleware, pedidoController.obtenerReporteVentas);

router.get('/pedido', authMiddleware, pedidoController.pedidosCliente);

module.exports = router;
