import multer from 'multer';
import path from 'path';

// const FILE_SIZE_LIMIT = 100 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fileType = file.mimetype.startsWith('image') ? 'images' : 'videos';
    cb(null, `./uploads/${fileType}`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images and videos are allowed!'));
  }
};

const upload = multer({
  storage,
  // limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter
});

export default upload;