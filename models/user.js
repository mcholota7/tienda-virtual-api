const { DataTypes } = require('sequelize');

const UserModel = (sequelize) => {
  const Usuario = sequelize.define('usuario', {
    idusuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idpersona: {
      type: DataTypes.INTEGER,
      references: {
        model: 'persona',
        key: 'idpersona'
      },
    },
    idtipo_usuario: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tipo_usuario',
        key: 'idtipo_usuario'
      },
    },
    nombre_usuario: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contrasena: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'usuario',
    timestamps: false,
  });

  Usuario.associate = (models) => {
    Usuario.belongsTo(models.persona, {
      foreignKey: 'idpersona',
      as: 'persona' 
    });
  };

  return Usuario;
};

module.exports = UserModel;
