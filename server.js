require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const multer = require('multer'); 
const fs = require('fs');
const path = require('path');
const { connectMongo, connectPostgres, syncDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const repuestoRoutes = require('./routes/repuestoRoutes');
const marcaRoutes = require('./routes/marcaRoutes');
const modeloRoutes = require('./routes/modeloRoutes');
const pedidoRoutes = require('./routes/pedidoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const imageRouter = require('./routes/imageRoutes');
const db = require('./models'); 
const app = express();

app.use(cors());
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('La carpeta "uploads" ha sido creada');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); 
  }
});

const upload = multer({ storage: storage });

const startServer = async () => {
  await connectMongo();

  const sequelize = await connectPostgres();
  if (!sequelize) {
    console.error('No se pudo conectar a PostgreSQL.');
    return;
  }

  try {
    await db.sequelize.sync({ force: false });
    console.log('Sincronización de modelos completada');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
    return;
  }

  app.use(express.json());

  app.get('/', (req, res) => {
    res.send('Servidor está funcionando correctamente');
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/repuestos', repuestoRoutes);
  app.use('/api/marcas', marcaRoutes);
  app.use('/api/modelos', modeloRoutes);
  app.use('/api/pedidos', pedidoRoutes);
  app.use('/api/inventario', inventarioRoutes);
  app.use('/api/imagenes', imageRouter);
  app.post('/upload', upload.single('imagen'), (req, res) => {
    if (!req.file) {
      return res.status(400).send('No se cargó ningún archivo');
    }
    res.send({ filePath: `/uploads/${req.file.filename}` });
  });

  app.use('/uploads', express.static(uploadsDir));


  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
  });


  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
  });
};


startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
});
