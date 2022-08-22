const jwt = require("jsonwebtoken");
const setting = require("../configs/setting");

const signRefreshJwt = (payload) => {
  const token = jwt.sign(payload, setting.jwtRefresh, {
    expiresIn: setting.jwtExpiresInRefreshToken,
  });

  return token;
};

module.exports = signRefreshJwt;
