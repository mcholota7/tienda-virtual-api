const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPEG o PNG.'), false); 
  }
};

const upload = multer({
  storage, 
  fileFilter, 
  limits: { fileSize: 2 * 1024 * 1024 }, 
});

module.exports = upload;
