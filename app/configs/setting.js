require("dotenv").config();
const path = require("path");

module.exports = {
  rootPath: path.resolve(__dirname, "../../"),
  serviceName: "exercise-api-sequelize",
  jwtKey: process.env.SECRET,
};
