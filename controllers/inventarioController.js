const { Repuesto, Marca, Modelo, usuario } = require('../models');

exports.listarInventario = async (req, res) => {
    try {
      const idusuario = req.user?.idusuario; 
      const Usuario = await usuario.findByPk(idusuario);
      if (!Usuario || Usuario.idtipo_usuario !== 1) {
        return res.status(403).json({ message: 'No autorizado.' });
      }
      const inventario = await Repuesto.findAll({
        include: [
          {
            model: Modelo,
            as: 'modelo',
            include: [
              {
                model: Marca,
                as: 'marca',
                attributes: ['nombre_marca']
              }
            ],
            attributes: ['nombre_modelo']
          }
        ],
        attributes: ['idrepuesto', 'nombre_repuesto', 'cantidad', 'precio']
      });
  
      res.status(200).json(inventario);
    } catch (error) {
      console.error('Error al listar el inventario:', error);
      res.status(500).json({ message: 'Error al listar el inventario.' });
    }
  };