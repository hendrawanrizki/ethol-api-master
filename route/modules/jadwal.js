const express = require("express");
const controller = require("../../controller/jadwal");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");

router.get(
  "/list-generate-jadwal",
  [authMiddleware, controller.validasi("semua_jadwal")],
  controller.listGenerateJadwal
);
router.post(
  "/proses-generate-jadwal",
  [authMiddleware, adminMiddleware, controller.validasi("generate_jadwal")],
  controller.generateJadwal
);

// digunakan untuk melihat jadwal kuliah sebelum di generate
router.get(
  "/",
  [authMiddleware, controller.validasi("jadwal_kuliah")],
  controller.index
);

router.get(
  "/jadwal-online",
  [authMiddleware, controller.validasi("jadwal_online")],
  controller.jadwalOnline
);
module.exports = router;
