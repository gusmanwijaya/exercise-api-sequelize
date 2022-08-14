const CustomError = require("../errors");
const verifyJwt = require("../utils/verifyJwt");

const authenticationUsers = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      throw new CustomError.Forbidden("Silahkan sign in terlebih dahulu");
    }

    const payload = verifyJwt(token);

    req.user = {
      id: payload?.id,
      name: payload?.name,
      email: payload?.email,
      roles: payload?.roles,
      address: payload?.address,
      houseNumber: payload?.houseNumber,
      phoneNumber: payload?.phoneNumber,
      city: payload?.city,
      picturePath: payload?.picturePath,
    };

    next();
  } catch (error) {
    next(error);
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      throw new CustomError.Unauthorized(
        "Anda ditolak untuk mengakses route ini"
      );
    }
    next();
  };
};

module.exports = {
  authenticationUsers,
  authorizeRoles,
};
