"use strict";
const { Model } = require("sequelize");
const moment = require("moment");

module.exports = (sequelize, DataTypes) => {
  class RefreshTokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RefreshTokens.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  }
  RefreshTokens.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      refresh_token: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        get: function () {
          return moment(this.getDataValue("createdAt")).format(
            "DD-MM-YYYY hh:mm A"
          );
        },
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        get: function () {
          return moment(this.getDataValue("updatedAt")).format(
            "DD-MM-YYYY hh:mm A"
          );
        },
      },
    },
    {
      sequelize,
      modelName: "RefreshTokens",
      tableName: "refresh_tokens",
    }
  );
  return RefreshTokens;
};
