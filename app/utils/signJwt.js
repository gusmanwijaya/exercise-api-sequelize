const jwt = require("jsonwebtoken");
const setting = require("../configs/setting");

const signJwt = (payload) => {
  const token = jwt.sign(payload, setting.jwtKey, {
    expiresIn: setting.jwtExpiresInAccessToken,
  });

  return token;
};

module.exports = signJwt;
