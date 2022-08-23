const { Foods } = require("../models");
const CustomError = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const { rootPath } = require("../../../configs/setting");
const fs = require("fs");

const create = async (req, res, next) => {
  try {
    const { name, description, ingredients, price, rate, types } = req.body;

    if (!name) throw new CustomError.BadRequest("Nama tidak boleh kosong");
    if (!price) throw new CustomError.BadRequest("Harga tidak boleh kosong");

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(name))
      throw new CustomError.BadRequest("Nama tidak valid");

    if (pattern.test(description))
      throw new CustomError.BadRequest("Deskripsi tidak valid");

    if (pattern.test(ingredients))
      throw new CustomError.BadRequest("Ingredients tidak valid");

    if (pattern.test(price))
      throw new CustomError.BadRequest("Harga tidak valid");

    if (pattern.test(rate))
      throw new CustomError.BadRequest("Rate tidak valid");

    if (pattern.test(types))
      throw new CustomError.BadRequest("Tipe tidak valid");

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
    const { page = 1, limit = 10 } = req.query;

    const parsePage = parseInt(page);
    const parseLimit = parseInt(limit);

    const data = await Foods.findAll({
      offset: parseLimit * (parsePage - 1),
      limit: parseLimit,
    });

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

const getByTypes = async (req, res, next) => {
  try {
    const { types } = req.query;

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(types))
      throw new CustomError.BadRequest("Types tidak valid");

    const data = await Foods.findAll({
      where: {
        types,
      },
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Berhasil mendapatkan data foods berdasarkan types",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const { id: foodId } = req.params;

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(foodId))
      throw new CustomError.BadRequest("Food id tidak valid");

    const foodIdParse = parseInt(foodId);

    const data = await Foods.findOne({
      where: {
        id: foodIdParse,
      },
    });

    if (!data)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodIdParse} tidak ditemukan`
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

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(foodId))
      throw new CustomError.BadRequest("Food id tidak valid");

    if (pattern.test(name))
      throw new CustomError.BadRequest("Nama tidak valid");

    if (pattern.test(description))
      throw new CustomError.BadRequest("Deskripsi tidak valid");

    if (pattern.test(ingredients))
      throw new CustomError.BadRequest("Ingredients tidak valid");

    if (pattern.test(price))
      throw new CustomError.BadRequest("Harga tidak valid");

    if (pattern.test(rate))
      throw new CustomError.BadRequest("Rate tidak valid");

    if (pattern.test(types))
      throw new CustomError.BadRequest("Tipe tidak valid");

    const foodIdParse = parseInt(foodId);

    let data = await Foods.findOne({
      where: {
        id: foodIdParse,
      },
    });

    if (!data)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodIdParse} tidak ditemukan`
      );

    if (!req.file) {
      data.name = name;
      data.description = description;
      data.ingredients = ingredients;
      data.price = price;
      data.rate = rate;
      data.types = types;
    } else {
      const currentImage = `${rootPath}/public/uploads/foods/${data.picturePath}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      data.name = name;
      data.description = description;
      data.ingredients = ingredients;
      data.price = price;
      data.rate = rate;
      data.types = types;
      data.picturePath = req.file.filename;
    }

    await data.save();

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

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(foodId))
      throw new CustomError.BadRequest("Food id tidak valid");

    const foodIdParse = parseInt(foodId);

    const data = await Foods.findOne({
      where: {
        id: foodIdParse,
      },
    });

    if (!data)
      throw new CustomError.NotFound(
        `Food dengan id: ${foodIdParse} tidak ditemukan`
      );

    const currentImage = `${rootPath}/public/uploads/foods/${data.picturePath}`;

    if (fs.existsSync(currentImage)) {
      fs.unlinkSync(currentImage);
    }

    await data.destroy();

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
  getByTypes,
};
