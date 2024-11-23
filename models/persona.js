const { DataTypes } = require('sequelize');

const PersonaModel = (sequelize) => {
  const Persona = sequelize.define('persona', {
    idpersona: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    telefono: {
      type: DataTypes.STRING,
    },
    tipo_documento: {
      type: DataTypes.STRING,
    },
    numero_documento: {
      type: DataTypes.STRING,
    },
    provincia: {
      type: DataTypes.STRING,
    },
    ciudad: {
      type: DataTypes.STRING,
    },
    direccion: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'persona',
    timestamps: false,
  });

  Persona.associate = (models) => {
    Persona.hasOne(models.usuario, {
      foreignKey: 'idpersona',
      as: 'usuario'  
    });
  };

  return Persona;
};

module.exports = PersonaModel;
