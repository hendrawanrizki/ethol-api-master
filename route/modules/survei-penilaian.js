const express = require("express");
const controller = require("../../controller/survei-penilaian");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");

router.get("/", [authMiddleware], controller.index);
router.post(
  "/",
  [authMiddleware, controller.validasi("simpan")],
  controller.simpan
);
module.exports = router;
