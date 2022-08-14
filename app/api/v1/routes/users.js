const express = require("express");
const router = express.Router();

const { signUp, signIn } = require("../controllers/users");

const uploadMiddleware = require("../../../middlewares/multer");

router.post("/sign-up", uploadMiddleware.single("picturePath"), signUp);
router.post("/sign-in", signIn);

module.exports = router;
