const multer = require('multer');

// Setup multer for file upload

module.exports = async () => {
  try {
   const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
    
const upload = multer({ storage });
    console.log("Upload succesfful");
  } catch (error) {
    console.log(error.message);
  }
};


