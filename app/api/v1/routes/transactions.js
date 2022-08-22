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
  destroy,
} = require("../controllers/transactions");

const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middlewares/auth");

router.post("/notification", notification);
router.get("/finish", finish);
router.get("/unfinish", unfinish);
router.get("/error", error);

router.use(authenticationUsers);
router.use(authorizeRoles("admin", "client"));

router.post("/create", create);
router.delete("/destroy/:id", destroy);
router.get("/get", get);
router.get("/detail/:id", detail);

module.exports = router;
