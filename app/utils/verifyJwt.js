const jwt = require("jsonwebtoken");
const setting = require("../configs/setting");

const verifyJwt = (token) => jwt.verify(token, setting.jwtKey);

module.exports = verifyJwt;
