const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    const directory = req.baseUrl.split("/")[req.baseUrl.split("/").length - 1];
    callback(null, `public/uploads/${directory}`);
  },
  filename: function (req, file, callback) {
    callback(null, new Date().getTime().toString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(
      {
        statusCode: 400,
        message: "Format file tidak didukung",
      },
      false
    );
  }
};

const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 5000000, //5MB
  },
  fileFilter,
});

module.exports = uploadMiddleware;
