
const { EncabezadoPedido, DetallePedido, Repuesto, Estado, usuario, persona, Modelo, Marca, sequelize, Sequelize} = require('../models');
const EncabezadoPedidoMongo = require('../models/encabezadoPedidoMongo');
const DetallePedidoMongo = require('../models/detallePedidoMongo');
const RepuestoMongo = require('../models/repuestoMongoose');
const { Op } = require('sequelize');
const moment = require('moment-timezone');

exports.crearPedido = async (req, res) => {
  const { idusuario, idestado, observacion, detalles } = req.body;

  try {
    const encabezadoPostgres = await EncabezadoPedido.create({
      idusuario,
      idestado,
      observacion
    });

    const encabezadoMongo = new EncabezadoPedidoMongo({
      idusuario,
      idestado,
      observacion
    });
    await encabezadoMongo.save();

    const detallesPedidos = [];

    for (const item of detalles) {
      const { idrespuesto, cantidad } = item;

      const repuesto = await Repuesto.findByPk(item.idrespuesto); 
            if (!repuesto) {
                return res.status(404).json({ message: `Repuesto con id ${item.idrespuesto} no encontrado` });
            }
      const detallePostgres = await DetallePedido.create({
        idencabezado_pedido: encabezadoPostgres.idencabezado_pedido,
        idrepuesto:idrespuesto,
        precio: repuesto.precio,
        cantidad
      });

      const detalleMongo = new DetallePedidoMongo({
        idencabezado_pedido: encabezadoMongo._id,
        idrespuesto,
        precio: repuesto.precio,
        cantidad
      });
      await detalleMongo.save();

      detallesPedidos.push({ postgres: detallePostgres, mongo: detalleMongo });

      const repuestoMongo = await RepuestoMongo.findById(idrespuesto);
      if (!repuestoMongo || repuestoMongo.cantidad < cantidad) {
        throw new Error('Cantidad insuficiente en inventario en MongoDB');
      }
      repuestoMongo.cantidad -= cantidad;
      await repuestoMongo.save();

      const repuestoPostgres = await Repuesto.findByPk(idrespuesto);
      if (!repuestoPostgres || repuestoPostgres.cantidad < cantidad) {
        throw new Error('Cantidad insuficiente en inventario en PostgreSQL');
      }
      repuestoPostgres.cantidad -= cantidad;
      await repuestoPostgres.save();
    }

    res.status(201).json({
      message: 'Pedido creado con éxito',
      encabezado: { postgres: encabezadoPostgres, mongo: encabezadoMongo },
      detalles: detallesPedidos
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

exports.actualizarEstadoPedido = async (req, res) => {
  const { idencabezado_pedido, idestado, observacion } = req.body;

  try {
      const encabezadoPostgres = await EncabezadoPedido.findByPk(idencabezado_pedido);
      if (!encabezadoPostgres) {
          return res.status(404).json({ message: 'Pedido no encontrado en PostgreSQL' });
      }

      await encabezadoPostgres.update({
          idestado,
          observacion,
          fecha_actualizacion: new Date()
      });

      const encabezadoMongo = await EncabezadoPedidoMongo.findById(idencabezado_pedido);
      if (!encabezadoMongo) {
          return res.status(404).json({ message: 'Pedido no encontrado en MongoDB' });
      }

      encabezadoMongo.idestado = idestado;
      encabezadoMongo.observacion = observacion;
      encabezadoMongo.fecha_actualizacion = new Date();
      await encabezadoMongo.save();

      if (idestado === 4) { 
          const detallesPostgres = await DetallePedido.findAll({
              where: { idencabezado_pedido }
          });

          const detallesMongo = await DetallePedidoMongo.find({ idencabezado_pedido });

          for (const detalle of detallesPostgres) {
            const repuesto = await Repuesto.findByPk(detalle.idrespuesto);
            if (repuesto) {
            await repuesto.update({
                cantidad: repuesto.cantidad + detalle.cantidad
            });
          }
        }
        
          for (const detalle of detallesMongo) {
              const repuesto = await RepuestoMongo.findById(detalle.idrespuesto);
              if (repuesto) {
                  repuesto.cantidad += detalle.cantidad;
                  await repuesto.save();
              }
          }
      }

      res.status(200).json({ message: 'Estado de pedido actualizado en ambas bases de datos' });
  } catch (error) {
      console.error('Error al actualizar estado del pedido:', error);
      res.status(500).json({ message: 'Error al actualizar estado del pedido', error: error.message });
  }
};

exports.verMisPedidos = async (req, res) => {
  try {    
    const { idusuario } = req.user;
    const estadosDeseados = [1, 2];

    const estados = await Estado.findAll();
    console.log('Estados disponibles:', estados);
    const pedidos = await EncabezadoPedido.findAll({
      where: { idusuario, idestado: estadosDeseados },
      include: {
        model: Estado,
        as: 'estado', 
        attributes: ['nombre_estado'] 
      }
    });

    console.log('Consulta de pedidos:', JSON.stringify(pedidos, null, 2)); 

    if (pedidos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pedidos para este usuario.' });
    }

    const pedidosFormateados = pedidos.map(pedido => ({
      id: pedido.idencabezado_pedido,
      fecha: pedido.fecha_pedido.toISOString().split('T')[0], 
      estado: pedido.estado.nombre_estado,
      observacion: pedido.observacion,
      fechaActualizacion: pedido.fecha_actualizacion.toISOString().split('T')[0],
    }));

    res.json(pedidosFormateados);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
};

exports.verMisPedidosAnteriores = async (req, res) => {
  try {    
    const { idusuario } = req.user;
    const estadosDeseados = [3, 4];

    const estados = await Estado.findAll();
    console.log('Estados disponibles:', estados);

    const pedidos = await EncabezadoPedido.findAll({
      where: { idusuario, idestado: estadosDeseados },
      include: {
        model: Estado,
        as: 'estado', 
        attributes: ['nombre_estado'] 
      }
    });

    console.log('Consulta de pedidos:', JSON.stringify(pedidos, null, 2)); 

    if (pedidos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron pedidos para este usuario.' });
    }

    const pedidosFormateados = pedidos.map(pedido => ({
      id: pedido.idencabezado_pedido,
      fecha: pedido.fecha_pedido.toISOString().split('T')[0], 
      estado: pedido.estado.nombre_estado,
      observacion: pedido.observacion,
      fechaActualizacion: pedido.fecha_actualizacion.toISOString().split('T')[0], 
    }));

    res.json(pedidosFormateados);
  } catch (error) {
    console.error('Error al obtener pedidos del cliente:', error);
    res.status(500).json({ message: 'Error al obtener pedidos.' });
  }
};

exports.obtenerDetallePedido = async (req, res) => {
  const { idpedido } = req.params; 
  if (!idpedido) {
    return res.status(400).json({ message: 'ID del pedido no proporcionado en la URL.' });
  }

  try {
    const encabezadoPedido = await EncabezadoPedido.findOne({
      where: {
        idencabezado_pedido: idpedido
      },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Repuesto,
              as: 'repuesto', 
              attributes: ['nombre_repuesto', 'imagen_url'] 
            }
          ]
        }
      ]
    });

    if (!encabezadoPedido) {
      return res.status(404).json({ message: 'Pedido no encontrado o no autorizado.' });
    }

    res.json(encabezadoPedido);

  } catch (error) {
    console.error('Error al obtener el detalle del pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.obtenerOrdenesPorEstado = async (req, res) => {
  try {
    const estadosDeseados = [1, 2]; 
    const ordenes = await EncabezadoPedido.findAll({
      where: {
        idestado: estadosDeseados
      },
      include: [
        {
          model: usuario,
          as: 'usuario',
          include: [{
            model: persona,
            as: 'persona',
            attributes: ['nombres', 'apellidos'] 
          }],
          attributes: [] 
        },
        {
          model: Estado,
          as: 'estado',
          attributes: ['nombre_estado'] 
        }
      ],
      attributes: [
        'idencabezado_pedido',
        [Sequelize.fn('DATE', Sequelize.col('fecha_pedido')), 'fecha_pedido'], 
        [Sequelize.fn('DATE', Sequelize.col('fecha_actualizacion')), 'fecha_actualizacion'],
        'observacion'
      ] 
    });
    res.status(200).json(ordenes);

  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes de los clientes.' });
  }
};

exports.obtenerReporteVentas = async (req, res) => {
  const { fechaDesde, fechaHasta } = req.query; // Fecha desde y hasta

  if (!fechaDesde || !fechaHasta) {
    return res.status(400).json({ message: 'Las fechas de rango son necesarias.' });
  }

  try {
    let fecha1 = moment(fechaDesde).tz('America/Guayaquil').startOf('day'); 
    let fecha2 = moment(fechaHasta).tz('America/Guayaquil').endOf('day'); 

    const fecha1UTC = fecha1.utc().toISOString();  
    const fecha2UTC = fecha2.utc().toISOString(); 

    const pedidos = await EncabezadoPedido.findAll({
      where: {
        fecha_pedido: {
          [Op.between]: [fecha1UTC, fecha2UTC] 
        }
      },
      include: [
        {
          model: DetallePedido,
          as: 'detalles',
          include: [
            {
              model: Repuesto,
              as: 'repuesto',
              attributes: ['nombre_repuesto'],
              include: [
                {
                  model: Modelo,
                  as: 'modelo',
                  attributes: ['nombre_modelo'],
                  include: [
                    {
                      model: Marca,
                      as: 'marca',
                      attributes: ['nombre_marca']
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    const reporteVentas = pedidos.reduce((acc, pedido) => {
      pedido.detalles.forEach(detalle => {
        const repuesto = detalle.repuesto.nombre_repuesto;
        const modelo = detalle.repuesto.modelo.nombre_modelo;
        const marca = detalle.repuesto.modelo.marca.nombre_marca;
        const cantidadVendida = detalle.cantidad;

        const clave = `${repuesto}-${modelo}-${marca}`;

        if (acc[clave]) {
          acc[clave].cantidad += cantidadVendida;
        } else {
          acc[clave] = {
            repuesto,
            modelo,
            marca,
            cantidad: cantidadVendida
          }; 
        }
      });
      return acc;
    }, {});

    const reporteFinal = Object.values(reporteVentas);
    res.json(reporteFinal);
  } catch (error) {
    console.error('Error al obtener el reporte de ventas:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};



exports.pedidosCliente = async (req, res) => {
  try {
    const {idestado, fechaDesde, fechaHasta } = req.query;

    if (!fechaDesde || !fechaHasta) {
      return res.status(400).json({ message: 'Las fechas de rango son necesarias.' });
    }

      let fecha1 = moment(fechaDesde).tz('America/Guayaquil').startOf('day'); 
      let fecha2 = moment(fechaHasta).tz('America/Guayaquil').endOf('day');   
      const fecha1UTC = fecha1.utc().toISOString();  
      const fecha2UTC = fecha2.utc().toISOString(); 

    const ordenes = await EncabezadoPedido.findAll({
      where: {
        idestado: idestado,
        fecha_pedido: {
          [Op.between]: [fecha1UTC, fecha2UTC] // Filtrar por fecha dentro del rango
        }
      },
      include: [
        {
          model: usuario,
          as: 'usuario',
          include: [{
            model: persona,
            as: 'persona',
            attributes: ['nombres', 'apellidos'] 
          }],
          attributes: ['nombre_usuario'] 
        },
        {
          model: Estado,
          as: 'estado',
          attributes: ['idestado','nombre_estado'] 
        }
      ],
      attributes: [
        'idencabezado_pedido',
        [Sequelize.fn('DATE', Sequelize.col('fecha_pedido')), 'fecha_pedido'], // Formato de solo fecha
        [Sequelize.fn('DATE', Sequelize.col('fecha_actualizacion')), 'fecha_actualizacion'],
        'observacion'
      ] 
    });
    res.status(200).json(ordenes);

  } catch (error) {
    console.error('Error al obtener las órdenes:', error);
    res.status(500).json({ message: 'Error al obtener las órdenes de los clientes.' });
  }
};