const express = require("express");
const router = express.Router();

const {
  create,
  destroy,
  detail,
  get,
  update,
  getByTypes,
} = require("../controllers/foods");

const {
  authenticationUsers,
  authorizeRoles,
} = require("../../../middlewares/auth");
const uploadMiddleware = require("../../../middlewares/multer");

router.use(authenticationUsers);
router.get("/get", get);
router.get("/get-by-types", getByTypes);
router.get("/detail/:id", detail);

router.use(authorizeRoles("admin"));
router.post("/create", uploadMiddleware.single("picturePath"), create);
router.put("/update/:id", uploadMiddleware.single("picturePath"), update);
router.delete("/destroy/:id", destroy);

module.exports = router;
