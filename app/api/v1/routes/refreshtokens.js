const express = require("express");
const router = express.Router();

const { newAccessToken, get } = require("../controllers/refreshtokens");

router.post("/new-access-token", newAccessToken);
router.get("/get", get);

module.exports = router;
