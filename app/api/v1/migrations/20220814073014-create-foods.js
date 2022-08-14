"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("foods", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      ingredients: {
        type: Sequelize.TEXT,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rate: {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
      },
      types: {
        type: Sequelize.STRING,
      },
      picturePath: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("foods");
  },
};
