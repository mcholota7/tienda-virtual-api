const mongoose = require('mongoose');
const Counter = require('./Counter');

const ModeloSchema = new mongoose.Schema({
  _id: {
    type: Number
  },
  idmarca: {
    type: Number,
    required: true
  },
  nombre_modelo: {
    type: String,
    required: true
  }
}, {
  collection: 'modelo'
});

ModeloSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'modeloId' },
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

module.exports = mongoose.model('Modelo', ModeloSchema);
