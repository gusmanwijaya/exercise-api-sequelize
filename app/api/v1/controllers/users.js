const { Users } = require("../models");
const CustomError = require("../../../errors");
const createPayloadJwt = require("../../../utils/createPayloadJwt");
const signJwt = require("../../../utils/signJwt");

const { StatusCodes } = require("http-status-codes");
const bcrypt = require("bcryptjs");

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
    const token = signJwt(payload);

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Sign in berhasil",
      data: {
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
};
