const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/");
    console.log('reachign hereeeee');
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + path.extname(file.originalname);
    console.log('reaching here unique', unique)
    cb(null, file.fieldname + "-" + unique);
  },
});

const upload = multer({ storage });

module.exports = upload;
