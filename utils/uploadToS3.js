const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: ' ',
  secretAccessKey: ' ',
  region: 'us-east-2' 
});

const s3 = new AWS.S3();

const uploadToS3 = async (file, bucketName) => {
  if (!file || !file.buffer) {
    throw new Error("No se ha recibido un archivo válido o el buffer está vacío");
  }

  const params = {
    Bucket: bucketName,
    Key: `uploads/${Date.now()}-${file.originalname}`, 
    Body: file.buffer, 
    ContentType: file.mimetype 
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('Archivo subido con éxito:', data);
    return data.Location; 
  } catch (error) {
    console.error("Error al subir el archivo a S3:", error);
    throw error;
  }
};

module.exports = uploadToS3;
