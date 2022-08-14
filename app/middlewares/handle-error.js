const { StatusCodes } = require("http-status-codes");

const handleErrorMiddleware = (error, req, res, next) => {
  let customError = {
    statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message:
      error.message ||
      "Terjadi masalah pada server, silahkan coba lagi beberapa saat",
  };

  if (error.name === "ValidationError") {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = Object.values(error.errors)
      .map((value) => value.message)
      .join(", ");
  }

  if (error.code && error.code === 11000) {
    customError.statusCode = StatusCodes.BAD_REQUEST;
    customError.message = `Duplikat value untuk field ${Object.keys(
      error.keyValue
    )}, tolong masukkan value yang lain`;
  }

  if (error.name === "CastError") {
    customError.statusCode = StatusCodes.NOT_FOUND;
    customError.message = `Data dengan id : ${error.value} tidak tersedia`;
  }

  return res.status(customError.statusCode).json({
    statusCode: customError.statusCode,
    message: customError.message,
  });
};

module.exports = handleErrorMiddleware;
