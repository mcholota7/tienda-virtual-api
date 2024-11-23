const mongoose = require('mongoose');
const Counter = require('./Counter');

const UserSchema = new mongoose.Schema({
  _id: {
    type: Number,
    unique: true
  },
  nombre_usuario: {
    type: String,
    required: true,
    unique: true,
  },
  contrasena: {
    type: String,
    required: true,
  },
  idpersona: {
    type: Number,
    ref: 'Persona', 
    required: true,
  },
  idtipo_usuario: {
    type: Number,
    required: true,
  }
}, { collection: 'usuario' }); 


UserSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'usuarioId' },
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

module.exports = mongoose.model('User', UserSchema);
