const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Marca = sequelize.define('Marca', {
    idmarca: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_marca: {
      type: DataTypes.STRING,
      allowNull: false
    },
  }, {
    tableName: 'marca',
    timestamps: false
  });

  Marca.associate = (models) => {
    Marca.hasMany(models.Modelo, {
      foreignKey: 'idmarca',
      as: 'modelos' 
    });
  };

  return Marca;
};
