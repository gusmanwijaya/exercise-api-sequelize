const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// START: Import library yang diinstall
const cors = require("cors");
// END: Import library yang diinstall

// START: Import Routes
const usersRouter = require("./app/api/v1/routes/users");
const foodsRouter = require("./app/api/v1/routes/foods");
const transactionsRouter = require("./app/api/v1/routes/transactions");
const refreshtokensRouter = require("./app/api/v1/routes/refreshtokens");
// END: Import Routes

// START: Import middlewares
const notFoundMiddleware = require("./app/middlewares/not-found");
const handleErrorMiddleware = require("./app/middlewares/handle-error");
// END: Import middlewares

const app = express();

// START: Menggunakan library yang diinstall
app.use(cors());
// END: Menggunakan library yang diinstall

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const API_VERSION = "api/v1";

// START: Membuat route
app.use(`/${API_VERSION}/users`, usersRouter);
app.use(`/${API_VERSION}/foods`, foodsRouter);
app.use(`/${API_VERSION}/transactions`, transactionsRouter);
app.use(`/${API_VERSION}/refresh-tokens`, refreshtokensRouter);
// END: Membuat route

// START: Menggunakan middlewares
app.use(notFoundMiddleware);
app.use(handleErrorMiddleware);
// END: Menggunakan middlewares

module.exports = app;
