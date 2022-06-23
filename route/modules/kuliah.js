const express = require("express");
const controller = require("../../controller/kuliah");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.get("/", [authMiddleware], controller.ambil);
router.get("/by-kuliah-js", [authMiddleware], controller.ambilByKuliahJs);
router.post("/hari-kuliah-in", [authMiddleware], controller.hariKuliahIn);
router.get(
  "/peserta-kuliah",
  [authMiddleware, controller.validasi("peserta_kuliah")],
  controller.pesertaKuliah
);

module.exports = router;
