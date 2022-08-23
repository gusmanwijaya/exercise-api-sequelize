const { RefreshTokens, Users } = require("../models");
const CustomError = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const createPayloadRefreshJwt = require("../../../utils/createPayloadRefreshJwt");
const signRefreshJwt = require("../../../utils/signRefreshJwt");
const verifyRefreshJwt = require("../../../utils/verifyRefreshJwt");
const jwt = require("jsonwebtoken");
const createPayloadJwt = require("../../../utils/createPayloadJwt");
const signJwt = require("../../../utils/signJwt");

module.exports = {
  newAccessToken: async (req, res, next) => {
    try {
      const { refresh_token } = req.body;

      const pattern = new RegExp("[$+;=#|'`<>^*%!]");
      if (pattern.test(refresh_token))
        throw new CustomError.BadRequest("Request tidak valid");

      const decodeRefreshToken = jwt.decode(refresh_token);
      const dateNow = new Date().getTime() / 1000;
      if (decodeRefreshToken?.exp < dateNow)
        throw new CustomError.Unauthorized(
          "Refresh token sudah kadaluarsa, silahkan sign in"
        );

      const checkRefreshToken = await RefreshTokens.findOne({
        where: {
          refresh_token,
        },
      });
      if (!checkRefreshToken)
        throw new CustomError.NotFound("Refresh token tidak dapat ditemukan");

      const isRefreshTokenVerified = verifyRefreshJwt(refresh_token);
      if (!isRefreshTokenVerified)
        throw new CustomError.Unauthorized("Refresh token tidak valid");

      const user = await Users.findOne({
        where: {
          email: decodeRefreshToken?.email,
        },
        attributes: {
          exclude: ["password"],
        },
      });

      if (!user) throw new CustomError.NotFound("User tidak ditemukan");

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

      const payloadAccessToken = createPayloadJwt(user);
      const accessToken = signJwt(payloadAccessToken);

      res.status(StatusCodes.CREATED).json({
        statusCode: StatusCodes.CREATED,
        message: "Access token berhasil diperbaharui",
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const { user_id } = req.query;

      const pattern = new RegExp("[$+;=#|'`<>^*%!]");
      if (pattern.test(user_id))
        throw new CustomError.BadRequest("Query tidak valid");

      const userIdParse = parseInt(user_id);

      const data = await RefreshTokens.findOne({
        where: {
          user_id: userIdParse,
        },
        include: [
          {
            model: Users,
            as: "user",
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (!data)
        throw new CustomError.NotFound("Refresh token tidak dapat ditemukan");

      const decodeJwt = jwt.decode(data?.refresh_token);
      const dateNow = new Date().getTime() / 1000;

      if (decodeJwt?.exp < dateNow)
        throw new CustomError.Unauthorized(
          "Refresh token sudah kadaluarsa, silahkan sign in"
        );

      const isVerified = verifyRefreshJwt(data?.refresh_token);
      if (!isVerified)
        throw new CustomError.Unauthorized("Refresh token tidak valid");

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil mendapatkan data refresh token dari database",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { user_id } = req.params;

      const pattern = new RegExp("[$+;=#|'`<>^*%!]");
      if (pattern.test(user_id))
        throw new CustomError.BadRequest("Params tidak valid");

      const userIdParse = parseInt(user_id);

      const data = await RefreshTokens.findOne({
        where: {
          user_id: userIdParse,
        },
        include: [
          {
            model: Users,
            as: "user",
            attributes: {
              exclude: ["password", "createdAt", "updatedAt"],
            },
          },
        ],
      });

      if (!data)
        throw new CustomError.NotFound("Refresh token tidak dapat ditemukan");

      await data.destroy();

      res.status(StatusCodes.OK).json({
        statusCode: StatusCodes.OK,
        message: "Berhasil menghapus refresh token dari database",
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
