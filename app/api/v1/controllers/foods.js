const { Foods } = require("../models");
const CustomError = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { rootPath } = require("../../../configs/setting");
const fs = require("fs");

const create = async (req, res, next) => {
  try {
    const { name, description, ingredients, price, rate, types } = req.body;

    if (!name) throw new CustomError.BadRequest("Nama tidak boleh kosong");
    if (!price) throw new CustomError.BadRequest("Harga tidak boleh kosong");

    let data;

    if (!req.file) {
      data = await Foods.create({
        name,
        description,
        ingredients,
        price,
        rate,
        types,
      });
    } else {
      data = await Foods.create({
        name,
        description,
        ingredients,
        price,
        rate,
        types,
        picturePath: req.file.filename,
      });
    }

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Foods berhasil ditambahkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;

    const parsePage = parseInt(page);
    const parseLimit = parseInt(limit);

    let data;

    if (keyword) {
      data = await Foods.findAll({
        where: {
          name: {
            [Op.substring]: keyword,
          },
        },
        offset: parseLimit * (parsePage - 1),
        limit: parseLimit,
      });
    } else {
      data = await Foods.findAll({
        offset: parseLimit * (parsePage - 1),
        limit: parseLimit,
      });
    }

    const count = await Foods.count();

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Berhasil mendapatkan data foods",
      current_page: parsePage,
      total_page: Math.ceil(count / limit),
      total_data: count,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const { id: foodId } = req.params;

    const data = await Foods.findOne({
      where: {
        id: foodId,
      },
    });

    if (!data)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodId} tidak ditemukan`
      );

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Berhasil mendapatkan detail food",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id: foodId } = req.params;
    const { name, description, ingredients, price, rate, types } = req.body;

    const check = await Foods.findOne({
      where: {
        id: foodId,
      },
    });

    if (!check)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodId} tidak ditemukan`
      );

    let data;
    if (!req.file) {
      data = await Foods.update(
        {
          name,
          description,
          ingredients,
          price,
          rate,
          types,
        },
        {
          where: {
            id: foodId,
          },
        }
      );
    } else {
      const currentImage = `${rootPath}/public/uploads/foods/${check.picturePath}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      data = await Foods.update(
        {
          name,
          description,
          ingredients,
          price,
          rate,
          types,
          picturePath: req.file.filename,
        },
        {
          where: {
            id: foodId,
          },
        }
      );
    }

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Food berhasil diubah",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const destroy = async (req, res, next) => {
  try {
    const { id: foodId } = req.params;

    const check = await Foods.findOne({
      where: {
        id: foodId,
      },
    });

    if (!check)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodId} tidak ditemukan`
      );

    const currentImage = `${rootPath}/public/uploads/foods/${check.picturePath}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    const data = await Foods.destroy({
      where: {
        id: foodId,
      },
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Food berhasil dihapus",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  get,
  detail,
  update,
  destroy,
};