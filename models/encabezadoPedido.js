const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EncabezadoPedido = sequelize.define('EncabezadoPedido', {
    idencabezado_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idusuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idestado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_pedido: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    fecha_actualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    observacion: {
      type: DataTypes.STRING,
    }
  }, {
    tableName: 'encabezado_pedido',
    timestamps: false
  });

  EncabezadoPedido.associate = (models) => {
    EncabezadoPedido.belongsTo(models.Estado, {
      foreignKey: 'idestado',
      as: 'estado'
    });

    EncabezadoPedido.hasMany(models.DetallePedido, {
      foreignKey: 'idencabezado_pedido', 
      as: 'detalles'
    });

    EncabezadoPedido.belongsTo(models.usuario, {
      foreignKey: 'idusuario',
      as: 'usuario'
    });

    models.usuario.belongsTo(models.persona, {
      foreignKey: 'idpersona',
      as: 'personaEncabezado'
    });
  };

  return EncabezadoPedido;
};
