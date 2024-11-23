const { sequelize } = require('../config/db');
const ModeloPostgres = require('../models/modelo'); 
const ModeloMongo = require('../models/modeloMongoose'); 

const modelo = ModeloPostgres(sequelize);

exports.crearModelo = async (req, res) => {
  const { idmarca, nombre_modelo } = req.body;

  try {
    const nuevoModeloPostgres = await modelo.create({
      idmarca,
      nombre_modelo
    });

    const nuevoModeloMongo = new ModeloMongo({
      idmarca,
      nombre_modelo
    });
    await nuevoModeloMongo.save();

    res.status(201).json({
      message: 'Modelo creado exitosamente',
      postgres: nuevoModeloPostgres,
      mongo: nuevoModeloMongo
    });
  } catch (error) {
    console.error('Error al crear el modelo:', error);
    res.status(500).json({
      message: 'Error al crear el modelo',
      error: error.message
    });
  }
};

exports.obtenerModelosPorMarca = async (req, res) => {
  const { idmarca } = req.params;

  try {
    const modelosMongo = await ModeloMongo.find({ idmarca: parseInt(idmarca) });
    res.status(200).json({
      message: 'Modelos obtenidos exitosamente.',
      modelosMongo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los modelos.' });
  }
};