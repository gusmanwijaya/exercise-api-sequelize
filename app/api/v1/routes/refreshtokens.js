const express = require("express");
const router = express.Router();

const {
  newAccessToken,
  get,
  destroy,
} = require("../controllers/refreshtokens");

router.post("/new-access-token", newAccessToken);
router.get("/get", get);
router.delete("/destroy/:user_id", destroy);

module.exports = router;
