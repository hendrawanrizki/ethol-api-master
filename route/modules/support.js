const express = require("express");
const controller = require("../../controller/support");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const baakMiddleware = require("../../middleware/baak");
const dosenMiddleware = require("../../middleware/dosen");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");

router.get(
  "/",
  [authMiddleware, controller.validasi("list")],
  controller.index
);
router.get(
  "/list-admin",
  [authMiddleware, adminMiddleware],
  controller.indexAdmin
);
router.get(
  "/list-baak",
  [authMiddleware, baakMiddleware],
  controller.indexBaak
);
router.get(
  "/lampiran",
  [authMiddleware, controller.validasi("lampiran")],
  controller.getLampiran
);
router.post(
  "/",
  [authMiddleware, controller.validasi("buat")],
  controller.buat
);
router.post(
  "/balas",
  [authMiddleware, controller.validasi("balas")],
  controller.balas
);
router.post(
  "/tandai-selesai",
  [authMiddleware, controller.validasi("tandai_selesai")],
  controller.tandaiSelesai
);
router.get(
  "/balas",
  [authMiddleware, controller.validasi("list_balasan")],
  controller.getBalasan
);
router.get(
  "/nama",
  [authMiddleware, controller.validasi("nama")],
  controller.nama
);
router.delete(
  "/:nomor",
  [authMiddleware, controller.validasi("nonaktif")],
  controller.nonaktif
);
router.get(
  "/akun-baak",
  [authMiddleware, adminMiddleware],
  controller.akunBaak
);
router.delete(
  "/akun-baak/:nomor",
  [authMiddleware, adminMiddleware, controller.validasi("hapus_baak")],
  controller.hapusBaak
);
router.post(
  "/add-baak",
  [authMiddleware, adminMiddleware, controller.validasi("add_baak")],
  controller.addBaak
);
router.get(
  "/daftar-baak-yang-ikut",
  [authMiddleware, adminMiddleware, controller.validasi("nama")],
  controller.daftarBaakYangIkut
);
module.exports = router;
