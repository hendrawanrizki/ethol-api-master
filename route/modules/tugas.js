const express = require("express");
const controller = require("../../controller/tugas");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");
const baakMiddleware = require("../../middleware/baak");
const upload = require("../../middleware/upload/file");

router.get(
  "/",
  [authMiddleware, controller.validasi("list")],
  controller.index
);
router.get(
  "/by-nomor",
  [authMiddleware, controller.validasi("list_by_nomor")],
  controller.indexSingle
);
router.post(
  "/",
  [dosenMiddleware, upload.single("file"), controller.validasi("tambah")],
  controller.tambah
);
router.put(
  "/",
  [dosenMiddleware, upload.single("file"), controller.validasi("edit")],
  controller.edit
);
router.delete(
  "/:id",
  [authMiddleware, dosenMiddleware, controller.validasi("hapus")],
  controller.hapus
);
router.post(
  "/submit",
  [
    mahasiswaMiddleware,
    upload.single("file"),
    controller.validasi("simpan_jawaban"),
  ],
  controller.simpanJawaban
);
router.put(
  "/submit",
  [
    mahasiswaMiddleware,
    upload.single("file"),
    controller.validasi("update_jawaban"),
  ],
  controller.updateJawaban
);
router.get(
  "/jawaban-mahasiswa-by-id",
  [
    authMiddleware,
    mahasiswaMiddleware,
    controller.validasi("tugas_mahasiswa_by_id"),
  ],
  controller.jawabanTugasById
);
router.get(
  "/pekerjaan-mahasiswa",
  [authMiddleware, dosenMiddleware, controller.validasi("pekerjaan_mahasiswa")],
  controller.pekerjaanMahasiswa
);

router.put(
  "/update-catatan-nilai",
  [
    authMiddleware,
    dosenMiddleware,
    controller.validasi("update_catatan_nilai"),
  ],
  controller.updateCatatanNilai
);
router.post(
  "/tugas-terakhir-mahasiswa",
  [mahasiswaMiddleware],
  controller.daftarTugasTerakhirMahasiswa
);
router.get(
  "/rekap",
  [authMiddleware, dosenMiddleware, controller.validasi("rekap")],
  controller.rekapTugasKuliah
);
router.get(
  "/rekap-tugas/baak",
  [
    authMiddleware,
    baakMiddleware,
    controller.validasi("rekap_tugas_admin_baak"),
  ],
  controller.rekapTugasKuliahAdminBaak
);
router.get(
  "/detail-tugas/baak",
  [
    authMiddleware,
    baakMiddleware,
    controller.validasi("detail_tugas_admin_baak"),
  ],
  controller.detailTugasKuliahAdminBaak
);

module.exports = router;
