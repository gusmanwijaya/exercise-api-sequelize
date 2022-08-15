const express = require("express");
const router = express.Router();

const {
  signUp,
  signIn,
  updateProfile,
  detail,
} = require("../controllers/users");

const uploadMiddleware = require("../../../middlewares/multer");
const { authenticationUsers } = require("../../../middlewares/auth");

router.post("/sign-up", uploadMiddleware.single("picturePath"), signUp);
router.post("/sign-in", signIn);

router.use(authenticationUsers);
router.put(
  "/update-profile",
  uploadMiddleware.single("picturePath"),
  updateProfile
);
router.get("/detail", detail);

module.exports = router;
