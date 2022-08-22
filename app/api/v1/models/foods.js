"use strict";
const { Model } = require("sequelize");
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  class Foods extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Foods.hasOne(models.Transactions, {
        foreignKey: "id",
      });
    }
  }
  Foods.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      ingredients: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rate: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      types: {
        type: DataTypes.STRING,
      },
      picturePath: {
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
      modelName: "Foods",
      tableName: "foods",
    }
  );
  return Foods;
};
