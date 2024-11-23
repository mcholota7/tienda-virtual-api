const mongoose = require('mongoose');
const Counter = require('./Counter');

const DetallePedidoSchema = new mongoose.Schema({
  _id: {
    type: Number,
    unique: true
  },
  idencabezado_pedido: {
    type: Number,
    required: true,
  },
  idrespuesto: {
    type: Number,
    required: true,
  },
  precio: {
    type: Number,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
}, { collection: 'detalle_pedido' });

DetallePedidoSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'detallePedidoId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );
      doc._id = counter.sequence_value;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('DetallePedido', DetallePedidoSchema);
