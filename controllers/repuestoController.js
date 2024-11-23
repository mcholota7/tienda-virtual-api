const { sequelize } = require('../config/db'); 
const RepuestoPostgres = require('../models/repuesto'); 
const RepuestoMongo = require('../models/repuestoMongoose');  
const mongoose = require('mongoose');
const uploadToS3 = require('../utils/uploadToS3');
const repuesto = RepuestoPostgres(sequelize);


exports.crearRepuesto = async (req, res) => {
  try {
    const { idmodelo, nombre_repuesto, precio, cantidad, estado } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha cargado ninguna imagen' });
    }
    const imagenUrl = await uploadToS3(req.file, 'repuestos-ecommerce');
    console.log('URL de imagen generada:', imagenUrl);

    const nuevoRepuestoPostgres = await repuesto.create({
      nombre_repuesto,
      precio,
      idmodelo,
      cantidad,
      imagen_url: imagenUrl, 
      estado: estado || 'activo',
    });

    const nuevoRepuestoMongo = new RepuestoMongo({
      nombre_repuesto,
      precio,
      idmodelo,
      cantidad,
      imagen_url: imagenUrl, 
      estado: estado || 'activo',
    });

    await nuevoRepuestoMongo.save();

    res.status(201).json({
      message: 'Repuesto creado exitosamente',
      postgres: nuevoRepuestoPostgres,
      mongo: nuevoRepuestoMongo,
    });
  } catch (error) {
    console.error('Error al crear el repuesto:', error);
    res.status(500).json({
      message: 'Error al crear el repuesto',
      error: error.message,
    });
  }
};

  exports.actualizarRepuesto = async (req, res) => {
    const {
        idrepuesto,         
        nombre_repuesto,
        precio,
        idmodelo,
        cantidad,
        imagen_url
    } = req.body;

    try {
        const repuestoPostgres = await repuesto.findByPk(idrepuesto);
        if (!repuestoPostgres) {
            return res.status(404).json({ message: 'Repuesto no encontrado en PostgreSQL' });
        }

        await repuestoPostgres.update({
            nombre_repuesto,
            precio,
            idmodelo,
            cantidad,
            imagen_url,
            estado: 'activo'
        });

        const repuestoMongo = await RepuestoMongo.findById(idrepuesto);
        if (!repuestoMongo) {
            return res.status(404).json({ message: 'Repuesto no encontrado en MongoDB' });
        }
 
        repuestoMongo.nombre_repuesto = nombre_repuesto;
        repuestoMongo.precio = precio;
        repuestoMongo.idmodelo = idmodelo;
        repuestoMongo.cantidad = cantidad;
        repuestoMongo.imagen_url = imagen_url;
        repuestoMongo.estado = 'activo';
        await repuestoMongo.save();

        res.status(200).json({ message: 'Repuesto actualizado exitosamente en ambas bases de datos' });
    } catch (error) {
        console.error('Error al actualizar repuesto:', error);
        res.status(500).json({ message: 'Error al actualizar repuesto', error: error.message });
    }
};

exports.actualizarEstadoRepuesto = async (req, res) => {
  const { idrepuesto, estado } = req.body;

  try {
    const repuestoMongo = await RepuestoMongo.findByIdAndUpdate(
      idrepuesto,
      { estado },
      { new: true }
    );

    const repuestoPostgres = await repuesto.update(
      { estado },
      { where: { idrepuesto } }
    );

    if (!repuestoMongo && repuestoPostgres[0] === 0) {
      return res.status(404).json({ message: 'Repuesto no encontrado en ninguna base de datos.' });
    }

    res.status(200).json({
      message: 'Estado del repuesto actualizado exitosamente.',
      repuestoMongo,
      repuestoPostgres: repuestoPostgres[0] > 0 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el estado del repuesto.' });
  }
};

exports.buscarRepuestos = async (req, res) => {
  const { nombre_repuesto, idmarca, idmodelo } = req.query;
  const filtros = { estado: 'activo' };
  if (nombre_repuesto) {
    filtros.nombre_repuesto = { $regex: new RegExp(nombre_repuesto, 'i') };
  }
  try {
    const repuestos = await RepuestoMongo.aggregate([
      { $match: filtros },
      {
        $lookup: {
          from: 'modelo', 
          localField: 'idmodelo',
          foreignField: '_id',
          as: 'modelo'
        }
      },
      { $unwind: '$modelo' },
      {
        $lookup: {
          from: 'marca',
          localField: 'modelo.idmarca',
          foreignField: '_id',
          as: 'marca'
        }
      },
      { $unwind: '$marca' },
      ...(idmarca ? [{ $match: { 'marca._id': parseInt(idmarca, 10) } }] : []),
      ...(idmodelo ? [{ $match: { 'modelo._id': parseInt(idmodelo, 10) } }] : []),
      {
        $project: {
          _id: 1,
          nombre_repuesto: 1,
          precio: 1,
          cantidad: 1,
          imagen_url: 1,
          'modelo._id': 1,
          'modelo.nombre_modelo': 1,
          'marca._id': 1,
          'marca.nombre_marca': 1
        }
      }
    ]);

    res.status(200).json(repuestos);
  } catch (error) {
    console.error('Error al buscar repuestos:', error);
    res.status(500).json({ error: 'Error al buscar repuestos' });
  }
};

exports.repuestoIdById = async (req, res) => {
  const { id } = req.params; 

  try {
    const filtros = { _id: parseInt(id, 10), estado: 'activo' };
 
    const repuesto = await RepuestoMongo.aggregate([
      { $match: filtros },
      {
        $lookup: {
          from: 'modelo',
          localField: 'idmodelo',
          foreignField: '_id',
          as: 'modelo'
        }
      },
      { $unwind: '$modelo' },
      {
        $lookup: {
          from: 'marca', 
          localField: 'modelo.idmarca',
          foreignField: '_id',
          as: 'marca'
        }
      },
      { $unwind: '$marca' },
      {
        $project: {
          _id: 1,
          nombre_repuesto: 1,
          precio: 1,
          cantidad: 1,
          imagen_url: 1,
          'modelo._id': 1,
          'modelo.nombre_modelo': 1,
          'marca._id': 1,
          'marca.nombre_marca': 1
        }
      }
    ]);

    if (!repuesto || repuesto.length === 0) {
      return res.status(404).json({ error: 'Repuesto no encontrado' });
    }
    res.status(200).json(repuesto[0]);
  } catch (error) {
    console.error('Error al buscar repuesto por ID:', error);
    res.status(500).json({ error: 'Error al buscar repuesto por ID' });
  }
};

