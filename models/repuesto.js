const { DataTypes } = require('sequelize');

const RepuestoModel = (sequelize) => {
  const Repuesto = sequelize.define('Repuesto', {
    idrepuesto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre_repuesto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    idmodelo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'modelo',
        key: 'idmodelo'
      }
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    imagen_url: {
      type: DataTypes.STRING,
    },
    estado: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'activo',
    }
  }, {
    tableName: 'repuesto',
    timestamps: false,
  });

  Repuesto.associate = (models) => {
    Repuesto.belongsTo(models.Modelo, {
      foreignKey: 'idmodelo',
      as: 'modelo'
    });

    Repuesto.hasMany(models.DetallePedido, {
      foreignKey: 'idrepuesto',
      as: 'detalles'
    });
  };

  return Repuesto;
};

module.exports = RepuestoModel;
