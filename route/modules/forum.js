const express = require("express");
const controller = require("../../controller/forum");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");

router.get(
  "/",
  [authMiddleware, controller.validasi("list")],
  controller.index
);
router.post(
  "/",
  [authMiddleware, controller.validasi("buat")],
  controller.buat
);
router.put("/", [authMiddleware, controller.validasi("edit")], controller.edit);
router.post(
  "/komentar",
  [authMiddleware, controller.validasi("jawab")],
  controller.jawab
);
router.delete(
  "/:id",
  [authMiddleware, controller.validasi("hapus")],
  controller.hapus
);
router.delete(
  "/komentar/:id/:forum_id",
  [authMiddleware, controller.validasi("hapus")],
  controller.hapusKomentar
);
module.exports = router;
