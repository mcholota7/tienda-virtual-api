const mongoose = require('mongoose');
const Counter = require('./Counter');

const RepuestoSchema = new mongoose.Schema({
  _id: {                      
    type: Number,
    unique: true
  },
  nombre_repuesto: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  idmodelo: {
    type: Number,
    required: true
  },
  cantidad: {
    type: Number,
    required: true
  },
  imagen_url: {
    type: String 
  },
  estado: { 
    type: String, 
    default: 'activo' 
  }
}, {
  collection: 'repuesto'
});

RepuestoSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'repuestoId' },               
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

module.exports = mongoose.model('Repuesto', RepuestoSchema);
