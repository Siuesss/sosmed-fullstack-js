import multer from 'multer';
import path from 'path';

// const FILE_SIZE_LIMIT = 100 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/profils');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only images are allowed!'));
  }
};

const uploadProfile = multer({
  storage,
  // limits: { fileSize: FILE_SIZE_LIMIT },
  fileFilter
});

export default uploadProfile;