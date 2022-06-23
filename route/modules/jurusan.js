const express = require("express");
const controller = require("../../controller/jurusan");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");

router.get("/", [authMiddleware], controller.index);
router.get(
  "/detail",
  [authMiddleware, controller.validasi("detail")],
  controller.detailJurusan
);

module.exports = router;
