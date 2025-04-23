// models/cloudinary.js

const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();

    // Smart file type check
    let resourceType = 'auto';
    if (ext === 'pdf' || ext === 'docx' || ext === 'txt' || ext === 'zip') {
      resourceType = 'raw';
    }

    return {
      folder: 'uploads',
      resource_type: resourceType,
    };
  },
});

module.exports = { cloudinary, storage };
