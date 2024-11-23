const { sequelize } = require('../config/db');
const MarcaPostgres = require('../models/marca');         
const MarcaMongo = require('../models/marcaMongoose');    

const marca = MarcaPostgres(sequelize);

exports.crearMarca = async (req, res) => {
  const { nombre_marca } = req.body;

  try {
    const nuevaMarcaPostgres = await marca.create({
      nombre_marca
    });

    const nuevaMarcaMongo = new MarcaMongo({
      nombre_marca
    });
    await nuevaMarcaMongo.save();

    res.status(201).json({
      message: 'Marca creada exitosamente en ambas bases de datos',
      postgres: nuevaMarcaPostgres,
      mongo: nuevaMarcaMongo
    });
  } catch (error) {
    console.error('Error al crear la marca:', error);
    res.status(500).json({
      message: 'Error al crear la marca',
      error: error.message
    });
  }
};

exports.obtenerMarcas = async (req, res) => {
  try {
    const marcasMongo = await MarcaMongo.find();
    res.status(200).json({
      message: 'Marcas obtenidas exitosamente.',
      marcasMongo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener las marcas.' });
  }
};
