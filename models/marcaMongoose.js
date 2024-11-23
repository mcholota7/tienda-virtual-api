const mongoose = require('mongoose');
const Counter = require('./Counter');

const MarcaSchema = new mongoose.Schema({
  _id: {
    type: Number,
    unique: true
  },
  nombre_marca: {
    type: String,
    required: true
  }
}, {
  collection: 'marca'
});


MarcaSchema.pre('save', async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'marcaId' },
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

module.exports = mongoose.model('Marca', MarcaSchema);
