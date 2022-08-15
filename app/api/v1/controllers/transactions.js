require("dotenv").config();
const { Transactions, Foods, Users } = require("../models");
const CustomError = require("../../../errors");
const { StatusCodes } = require("http-status-codes");
const midtransClient = require("midtrans-client");
const randomstring = require("randomstring");

const { IS_PRODUCTION, CLIENT_KEY_MIDTRANS, SERVER_KEY_MIDTRANS } = process.env;

// Create Core API instance
let snap = new midtransClient.Snap({
  isProduction: IS_PRODUCTION === "development" ? false : true,
  serverKey: SERVER_KEY_MIDTRANS,
  clientKey: CLIENT_KEY_MIDTRANS,
});

const create = async (req, res, next) => {
  try {
    const { food_id, quantity } = req.body;

    const food = await Foods.findOne({
      where: {
        id: food_id,
      },
    });

    if (!food)
      throw new CustomError.BadRequest("Food yang Anda pesan tidak tersedia");

    const gross_amount = food.price * quantity;
    const order_id = `TRX-${randomstring.generate({
      length: 5,
      charset: "numeric",
    })}`;
    const user = req.user;

    let transaction = new Transactions({
      order_id,
      user_id: user.id,
      food_id,
      quantity,
      total: gross_amount,
      payment_url: "",
      token: "",
    });

    let parameter = {
      credit_card: {
        secure: true,
      },
      transaction_details: {
        gross_amount,
        order_id,
      },
      item_details: {
        id: food.id,
        price: food.price,
        quantity,
        name: food.name,
        category: food.types,
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.phoneNumber,
        billing_address: {
          first_name: user.name,
          email: user.email,
          phone: user.phoneNumber,
          address: user.address,
          city: user.city,
        },
        shipping_address: {
          first_name: user.name,
          email: user.email,
          phone: user.phoneNumber,
          address: user.address,
          city: user.city,
        },
      },
    };

    const payloadCreateTransaction = await snap.createTransaction(parameter);

    transaction.payment_url = payloadCreateTransaction.redirect_url;
    transaction.token = payloadCreateTransaction.token;
    await transaction.save();

    res.status(StatusCodes.CREATED).json({
      statusCode: StatusCodes.CREATED,
      message: "Berhasil membuat transaksi dengan midtrans",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const { food_id } = req.query;
    const user = req.user;

    let condition = {
      user_id: user.id,
    };

    if (food_id) {
      condition = {
        ...condition,
        food_id,
      };
    }

    const data = await Transactions.findAll({
      where: condition,
      include: [
        {
          model: Foods,
          as: "food",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Users,
          as: "user",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
      ],
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Berhasil mendapatkan data transaksi",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const detail = async (req, res, next) => {
  try {
    const { id: transactionId } = req.params;

    const user = req.user;

    const data = await Transactions.findOne({
      where: {
        id: transactionId,
        user_id: user.id,
      },
      include: [
        {
          model: Foods,
          as: "food",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: Users,
          as: "user",
          attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
          },
        },
      ],
    });

    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Berhasil mendapatkan data detail transaksi",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const notification = async (req, res, next) => {
  try {
    const requestFromMidtrans = req.body;

    snap.transaction
      .notification(requestFromMidtrans)
      .then(async (statusResponse) => {
        let transactionStatus = statusResponse.transaction_status;
        let orderId = statusResponse.order_id;
        // let fraudStatus = statusResponse.fraud_status;

        let transaction = await Transactions.findOne({
          where: {
            order_id: orderId,
          },
        });

        // if (transactionStatus == "capture") {
        //   // capture only applies to card transaction, which you need to check for the fraudStatus
        //   if (fraudStatus == "challenge") {
        //     // TODO set transaction status on your databaase to 'challenge'
        //   } else if (fraudStatus == "accept") {
        //     // TODO set transaction status on your databaase to 'success'
        //   }
        // }

        if (transactionStatus == "settlement") {
          // TODO set transaction status on your databaase to 'success'
          transaction.status = "settlement";
        } else if (transactionStatus == "deny") {
          // TODO you can ignore 'deny', because most of the time it allows payment retries
          // and later can become success
          transaction.status = "deny";
        } else if (
          transactionStatus == "cancel" ||
          transactionStatus == "expire"
        ) {
          // TODO set transaction status on your databaase to 'failure'
          transaction.status = "cancel";
        } else if (transactionStatus == "pending") {
          // TODO set transaction status on your databaase to 'pending' / waiting payment
          transaction.status = "pending";
        }

        transaction.notification_midtrans = JSON.stringify(statusResponse);
        await transaction.save();

        res.status(StatusCodes.CREATED).json({
          statusCode: StatusCodes.CREATED,
          message: "Midtrans berhasil mengirimkan notification",
          data: transaction,
        });
      })
      .catch((error) => next(error));
  } catch (error) {
    next(error);
  }
};

const finish = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message:
        "Selamat, pesanan berhasil dicheckout, silahkan segera lakukan pembayaran",
      data: req.query || req.body || null,
    });
  } catch (error) {
    next(error);
  }
};

const unfinish = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      statusCode: StatusCodes.OK,
      message: "Pesanan belum berhasil dicheckout",
      data: req.query || req.body || null,
    });
  } catch (error) {
    next(error);
  }
};

const error = async (req, res, next) => {
  try {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Oops, nampaknya terjadi error pada sistem kami",
      data: req.query || req.body || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  get,
  detail,
  notification,
  finish,
  unfinish,
  error,
};
