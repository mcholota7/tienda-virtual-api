const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Estado = sequelize.define('Estado', {
    idestado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_estado: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'estado',
    timestamps: false
  });
  console.log('Modelo Estado definido:', Estado === sequelize.models.Estado);

  Estado.associate = (models) => {
    console.log('Asociación Estado.hasMany EncabezadoPedido:', models.EncabezadoPedido !== undefined);
    Estado.hasMany(models.EncabezadoPedido, { 
      foreignKey: 'idestado',
      as: 'encabezadoPedidos' 
    });
  };

  return Estado;
};
