const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Modelo = sequelize.define('Modelo', {
    idmodelo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    idmarca: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre_modelo: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'modelo',
    timestamps: false
  });

  Modelo.associate = (models) => {
    Modelo.belongsTo(models.Marca, {
      foreignKey: 'idmarca',
      as: 'marca'  
    });

    Modelo.hasMany(models.Repuesto, {
      foreignKey: 'idmodelo',
      as: 'repuestos'  
    });
  };

  return Modelo;
};
