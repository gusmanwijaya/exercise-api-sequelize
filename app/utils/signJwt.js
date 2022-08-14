const jwt = require("jsonwebtoken");
const setting = require("../configs/setting");

const signJwt = (payload) => {
  const token = jwt.sign(payload, setting.jwtKey);
  return token;
};

module.exports = signJwt;
