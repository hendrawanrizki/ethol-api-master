const express = require("express");
const controller = require("../../controller/server-conference");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");

router.get("/", [authMiddleware], controller.index);
router.post(
  "/",
  [authMiddleware, adminMiddleware, controller.validasi("tambah")],
  controller.tambah
);
router.put(
  "/",
  [authMiddleware, adminMiddleware, controller.validasi("edit")],
  controller.edit
);
router.delete(
  "/:nomor",
  [authMiddleware, adminMiddleware, controller.validasi("hapus")],
  controller.hapus
);
module.exports = router;
