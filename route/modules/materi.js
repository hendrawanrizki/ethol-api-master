const express = require("express");
const controller = require("../../controller/materi");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");
const upload = require("../../middleware/upload/file");

router.get(
  "/",
  [authMiddleware, controller.validasi("list_materi")],
  controller.index
);
router.get(
  "/by-nomor",
  [authMiddleware, controller.validasi("list_by_nomor")],
  controller.indexSingle
);
router.get(
  "/by-id",
  [controller.validasi("list_by_nomor")],
  controller.indexSingleHashed
);
router.delete(
  "/:id",
  [authMiddleware, dosenMiddleware, controller.validasi("hapus_materi")],
  controller.hapus
);
router.post(
  "/",
  [dosenMiddleware, upload.single("file"), controller.validasi("tambah")],
  controller.tambah
);
router.get(
  "/matkul-sejenis",
  [authMiddleware, controller.validasi("matkul_sejenis")],
  controller.matkulSejenis
);
router.post(
  "/matkul-sejenis",
  [authMiddleware, controller.validasi("tambah_matkul_sejenis")],
  controller.tambahMatkulSejenis
);
router.get(
  "/daftar",
  [authMiddleware, controller.validasi("materi_by_program_jurusan")],
  controller.materiProgramJurusan
);

module.exports = router;
