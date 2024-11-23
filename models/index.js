// models/index.js
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  logging: false, 
});

const db = {};

const modelFiles = [
  'persona.js',
  'user.js',
  'repuesto.js',
  'marca.js',
  'modelo.js',
  'encabezadoPedido.js',
  'detallePedido.js',
  'estado.js',
];

modelFiles.forEach((file) => {
  const model = require(path.join(__dirname, file))(sequelize, DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
