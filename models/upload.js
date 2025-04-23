const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  publicId:String,
  fileType:String
});

module.exports = mongoose.model('Upload', uploadSchema);
