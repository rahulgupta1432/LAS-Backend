import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const timestamp = Date.now().toString();
    const hashedFileName = generateHashedFileName(file.originalname, timestamp);
    return {
      public_id: `mitra${hashedFileName}`, // Unique public ID
      resource_type: 'auto', // Automatically determine resource type
    };
  },
});

// Initialize multer instance with Cloudinary storage
const upload = multer({ storage });

// Function to generate a hashed file name
const generateHashedFileName = (fileName, timestamp) => {
  const hash = crypto.createHash('sha256');
  hash.update(fileName + timestamp);
  const hashedFileName = hash.digest('hex');
  const fileExtension = path.extname(fileName);
  return hashedFileName + fileExtension;
};


export const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    // If you're using multer's buffer, use the file buffer
    uploadStream.end(file.buffer);
  });
};



// Export the upload middleware
export { upload, generateHashedFileName };
