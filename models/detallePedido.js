const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DetallePedido = sequelize.define('DetallePedido', {
    iddetalle_pedido: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    idencabezado_pedido: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    idrepuesto: { 
      type: DataTypes.INTEGER,
      allowNull: false
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'detalle_pedido',
    timestamps: false
  });

  DetallePedido.associate = (models) => {
    DetallePedido.belongsTo(models.EncabezadoPedido, {
      foreignKey: 'idencabezado_pedido',
      as: 'encabezado'
    });

    DetallePedido.belongsTo(models.Repuesto, {
      foreignKey: 'idrepuesto',
      as: 'repuesto'
    });
  };

  return DetallePedido;
};
