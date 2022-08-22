require("dotenv").config();
const path = require("path");

module.exports = {
  rootPath: path.resolve(__dirname, "../../"),
  serviceName: "exercise-api-sequelize",
  jwtKey: process.env.SECRET,
  jwtRefresh: process.env.SECRET_REFRESH,
  jwtExpiresInAccessToken: process.env.EXPIRES_IN_ACCESS_TOKEN,
  jwtExpiresInRefreshToken: process.env.EXPIRES_IN_REFRESH_TOKEN,
};
