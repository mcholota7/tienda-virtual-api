const mongoose = require('mongoose');
const Counter = require('./Counter');


const EncabezadoPedidoSchema = new mongoose.Schema({
  _id: {
    type: Number,
    unique: true
  },
  idusuario: {
    type: Number,
    required: true,
  },
  idestado: {
    type: Number,
    required: true,
  },
  fecha_pedido: {
    type: Date,
    default: Date.now,
  },
  fecha_actualizacion: {
    type: Date,
    default: Date.now,
  },
  observacion: {
    type: String
  },
}, { collection: 'encabezado_pedido' });


EncabezadoPedidoSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'encabezadoPedidoId' },
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

module.exports = mongoose.model('EncabezadoPedido', EncabezadoPedidoSchema);
