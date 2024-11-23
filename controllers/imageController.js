const uploadToS3 = require('../utils/uploadToS3'); 

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No image uploaded' });
  }

  try {
    const imageUrl = await uploadToS3(req.file, 'your-s3-bucket-name'); 
    return res.status(200).send({ imagen_url: imageUrl });
  } catch (error) {
    return res.status(500).send({ message: 'Error uploading image', error });
  }
};
