const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: 'dfmvz8if7',
  api_key: '721268477474472',
  api_secret: 'rmr0_oY0yoYijPyyw3e2IAVj9rE',
});

const storage = multer.memoryStorage();

async function imageUpload(fileBuffer) {
  const result = await cloudinary.uploader.upload(fileBuffer, {
    resource_type: 'auto', 
  });

  return result;
}

const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, 
    },
  });
  

module.exports = {
  upload,
  imageUpload,
};
