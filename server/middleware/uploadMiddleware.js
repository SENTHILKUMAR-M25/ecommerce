import multer from 'multer';
import path from 'path';

// Storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },

  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname}`
    );
  }
});

// File Filter
function checkFileType(file, cb) {

  const filetypes = /jpg|jpeg|png|webp/;

  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only'));
  }
}

const upload = multer({
  storage,
  fileFilter: checkFileType
});

export default upload;