const { Users, RefreshTokens } = require("../models");
const CustomError = require("../../../errors");
const createPayloadJwt = require("../../../utils/createPayloadJwt");
const signJwt = require("../../../utils/signJwt");
const { rootPath } = require("../../../configs/setting");
const createPayloadRefreshJwt = require("../../../utils/createPayloadRefreshJwt");
const signRefreshJwt = require("../../../utils/signRefreshJwt");

const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const fs = require("fs");

const signUp = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      roles,
      address,
      houseNumber,
      phoneNumber,
      city,
    } = req.body;

    if (!name) throw new CustomError.BadRequest("Nama tidak boleh kosong");
    if (!email) throw new CustomError.BadRequest("Email tidak boleh kosong");

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(name))
      throw new CustomError.BadRequest("Nama tidak valid");

    if (pattern.test(roles))
      throw new CustomError.BadRequest("Roles tidak valid");

    if (pattern.test(address))
      throw new CustomError.BadRequest("Alamat tidak valid");

    if (pattern.test(houseNumber))
      throw new CustomError.BadRequest("No rumah tidak valid");

    if (pattern.test(phoneNumber))
      throw new CustomError.BadRequest("No handphone tidak valid");

    if (pattern.test(city))
      throw new CustomError.BadRequest("City tidak valid");

    const regexEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const checkFormatEmail = String(email).toLowerCase().match(regexEmail);
    if (!checkFormatEmail)
      throw new CustomError.BadRequest("Email yang Anda masukkan tidak valid");

    if (!password)
      throw new CustomError.BadRequest("Password tidak boleh kosong");
    if (password.length < 3)
      throw new CustomError.BadRequest(
        "Password tidak boleh kurang dari 3 karakter"
      );

    const hashPassword = bcrypt.hashSync(password, 12);

    const checkEmail = await Users.findOne({
      where: {
        email,
      },
    });
    if (checkEmail)
      throw new CustomError.BadRequest(
        `Email: ${email} sudah terdaftar pada sistem kami`
      );

    let data;
    if (!req.file) {
      data = await Users.create({
        name,
        email,
        password: hashPassword,
        roles,
        address,
        houseNumber,
        phoneNumber,
        city,
      });
    } else {
      data = await Users.create({
        name,
        email,
        password: hashPassword,
        roles,
        address,
        houseNumber,
        phoneNumber,
        city,
        picturePath: req.file.filename,
      });
    }

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Akun berhasil didaftarkan pada sistem kami",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) throw new CustomError.BadRequest("Email tidak boleh kosong");

    const regexEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const checkFormatEmail = String(email).toLowerCase().match(regexEmail);
    if (!checkFormatEmail)
      throw new CustomError.BadRequest("Email yang Anda masukkan tidak valid");

    if (!password)
      throw new CustomError.BadRequest("Password tidak boleh kosong");

    const user = await Users.findOne({
      where: {
        email,
      },
    });
    if (!user)
      throw new CustomError.Unauthorized(
        "Users tidak ditemukan, silahkan lakukan sign up terlebih dahulu"
      );

    const isPasswordMatch = bcrypt.compareSync(password, user.password);
    if (!isPasswordMatch) throw new CustomError.Unauthorized("Password salah");

    const payload = createPayloadJwt(user);
    const accessToken = signJwt(payload);

    const payloadRefreshToken = createPayloadRefreshJwt(user);
    const refreshToken = signRefreshJwt(payloadRefreshToken);

    let tempRefreshToken = await RefreshTokens.findOne({
      where: {
        user_id: user.id,
      },
    });
    if (!tempRefreshToken) {
      tempRefreshToken = new RefreshTokens({
        user_id: user.id,
        refresh_token: refreshToken,
      });
    } else {
      tempRefreshToken.refresh_token = refreshToken;
    }

    await tempRefreshToken.save();

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Sign in berhasil",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const data = await Users.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["password"],
      },
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Data user berhasil didapatkan",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, address, houseNumber, phoneNumber, city } = req.body;

    const pattern = new RegExp("[$+;=#|'`<>^*]");

    if (pattern.test(name))
      throw new CustomError.BadRequest("Nama tidak valid");

    if (pattern.test(address))
      throw new CustomError.BadRequest("Alamat tidak valid");

    if (pattern.test(houseNumber))
      throw new CustomError.BadRequest("No rumah tidak valid");

    if (pattern.test(phoneNumber))
      throw new CustomError.BadRequest("No handphone tidak valid");

    if (pattern.test(city))
      throw new CustomError.BadRequest("City tidak valid");

    const regexEmail =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const checkFormatEmail = String(email).toLowerCase().match(regexEmail);
    if (!checkFormatEmail)
      throw new CustomError.BadRequest("Email yang Anda masukkan tidak valid");

    const checkEmail = await Users.findOne({
      where: {
        id: {
          [Op.ne]: req.user.id,
        },
        email,
      },
      attributes: ["id", "email"],
    });

    if (checkEmail)
      throw new CustomError.BadRequest(`Email: ${email} sudah terdaftar`);

    let data = await Users.findOne({
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["password"],
      },
    });

    if (!data)
      throw new CustomError.NotFound(
        `Users dengan id: ${req.user.id} tidak ditemukan`
      );

    if (!req.file) {
      data.name = name;
      data.email = email;
      data.address = address;
      data.houseNumber = houseNumber;
      data.phoneNumber = phoneNumber;
      data.city = city;
    } else {
      const currentImage = `${rootPath}/public/uploads/users/${data.picturePath}`;

      if (fs.existsSync(currentImage)) {
        fs.unlinkSync(currentImage);
      }

      data.name = name;
      data.email = email;
      data.address = address;
      data.houseNumber = houseNumber;
      data.phoneNumber = phoneNumber;
      data.city = city;
      data.picturePath = req.file.filename;
    }

    await data.save();

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Profile berhasil diubah",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
  updateProfile,
  detail,
};
