const express = require("express");
const controller = require("../../controller/room-conference");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");

router.get("/", [authMiddleware], controller.index);
router.get("/umum", [authMiddleware], controller.indexUmum);
router.get(
  "/detail",
  [authMiddleware, controller.validasi("detail")],
  controller.detail
);
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
