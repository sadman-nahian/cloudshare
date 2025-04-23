require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors=require("cors");


const Upload = require("./models/upload");

const app = express();
app.use(cors())
const PORT = 3333;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.API_KEY,
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
const upload = multer({ storage });

// MongoDB connect
mongoose.connect(process.env.MONGODB_URI);
console.log('MongoDB connected');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'File upload failed' });
    }
     console.log(req.file)

    const fileUrl = req.file.path;
    const publicId = req.file.filename;
    const fileType=req.file.mimetype.split("/")[0];
    const newUpload = new Upload({
      title,
      description,
      fileUrl,
      publicId,
      fileType
      
    });

    await newUpload.save();

    res.json({ message: 'Upload successful', data: newUpload });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({
      error: true,
      message: err.message || 'Something went wrong',
    });
  }
});

//these are not required for this project doing to learn
app.get('/uploads', async (req, res) => {
    try {
      const uploads = await Upload.find(); 
      res.status(200).json(uploads);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
      res.status(500).json({ error: 'Failed to fetch uploads', message: error.message });
    }
  });
  

app.delete('/upload/:id', async (req, res) => {
  try {
    // Find the upload by its MongoDB _id
    const upload = await Upload.findById(req.params.id);
    

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Delete the file from Cloudinary using the publicId (filename)
    await cloudinary.uploader.destroy(upload.publicId, {
      resource_type: upload.fileType, 
    });

    
    await Upload.findByIdAndDelete(req.params.id);

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Delete failed', message: err.message });
  }
});
// app.put('/upload/:id', upload.single('file'), async (req, res) => {
//     try {
//       const { title, description } = req.body;
//       const fileUrl = req.file ? req.file.path : null; 
  
    
//       const upload = await Upload.findById(req.params.id);
//       if (!upload) {
//         return res.status(404).json({ error: 'Upload not found' });
//       }
  
//       // Update the upload details
//       if (title) upload.title = title;
//       if (description) upload.description = description;
//       if (fileUrl) upload.fileUrl = fileUrl; // Only update fileUrl if a new file is uploaded
  
//       // Save the updated document
//       await upload.save();
  
//       // if a new file was uploaded, delete the old file from Cloudinary
//       if (fileUrl) {
//         const publicId = upload.publicId; 
//         await cloudinary.uploader.destroy(publicId); 
//         upload.publicId = req.file.filename || req.file.public_id; 
//       }
  
//       res.json({ message: 'Upload updated successfully', data: upload });
//     } catch (err) {
//       console.error('Update failed:', err);
//       res.status(500).json({ error: true, message: err.message || 'Something went wrong' });
//     }
//   });
  
  
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
