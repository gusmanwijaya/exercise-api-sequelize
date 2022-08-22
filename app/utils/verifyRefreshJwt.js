const jwt = require("jsonwebtoken");
const setting = require("../configs/setting");

const verifyRefreshJwt = (token) => jwt.verify(token, setting.jwtRefresh);

module.exports = verifyRefreshJwt;
