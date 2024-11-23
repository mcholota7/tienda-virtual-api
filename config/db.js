const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
};

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL conectado');
    return sequelize; 
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', error);
    return null; 
  }
};


const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Base de datos de PostgreSQL sincronizada');
  } catch (error) {
    console.error('Error sincronizando la base de datos de PostgreSQL:', error);
  }
};

module.exports = { connectMongo, connectPostgres, sequelize, syncDatabase };
