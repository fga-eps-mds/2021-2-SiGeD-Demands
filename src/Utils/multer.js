const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
  storage: multer.diskStorage({

    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', '..', 'files', 'uploads'));
    },
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) {
          cb(err);
        } else {
          const fileName = `${hash.toString('hex')}-${file.originalname}`;
          cb(null, fileName);
        }
      });
    },
  }),
  limits: {
    // 5 MB max size
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedFormat = [
      'application/pdf',
    ];

    if (allowedFormat.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid format.'));
    }
  },

};
