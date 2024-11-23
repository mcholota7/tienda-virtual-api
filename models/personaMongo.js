const mongoose = require('mongoose');
const Counter = require('./Counter');

const PersonaSchema = new mongoose.Schema({
  _id: { 
    type: Number 
  },
  nombres: {
    type: String,
    required: true,
  },
  apellidos: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
  },
  tipo_documento: {
    type: String,
  },
  numero_documento: {
    type: String,
  },
  provincia: {
    type: String,
  },
  ciudad: {
    type: String,
  },
  direccion: {
    type: String,
  }
}, { collection: 'persona' }); 


PersonaSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'personaId' },               
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

module.exports = mongoose.model('Persona', PersonaSchema);
