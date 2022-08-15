const express = require("express");
const router = express.Router();

const {
  create,
  detail,
  get,
  notification,
  finish,
  unfinish,
  error,
} = require("../controllers/transactions");

const { authenticationUsers } = require("../../../middlewares/auth");

router.post("/notification", notification);
router.get("/finish", finish);
router.get("/unfinish", unfinish);
router.get("/error", error);

router.use(authenticationUsers);

router.post("/create", create);
router.get("/get", get);
router.get("/detail/:id", detail);

module.exports = router;
