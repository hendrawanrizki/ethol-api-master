const express = require("express");
const controller = require("../../controller/mis");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");

router.get("/agama", [authMiddleware, adminMiddleware], controller.agama);
router.get("/hari", [authMiddleware, adminMiddleware], controller.hari);
router.get("/jam", [authMiddleware, adminMiddleware], controller.jam);
router.get("/jam-pjj", [authMiddleware, adminMiddleware], controller.jamPjj);
router.get(
  "/jam-psdku",
  [authMiddleware, adminMiddleware],
  controller.jamPsdku
);
router.get("/jam-reg", [authMiddleware, adminMiddleware], controller.jamReg);
router.get(
  "/jenis-schema",
  [authMiddleware, adminMiddleware],
  controller.jenisSchema
);
router.get("/jurusan", [authMiddleware, adminMiddleware], controller.jurusan);
router.get("/kelas", [authMiddleware, adminMiddleware], controller.kelas);
router.get(
  "/kuliah",
  [authMiddleware, adminMiddleware, controller.validasi("kuliah")],
  controller.kuliah
);
router.get(
  "/matakuliah",
  [authMiddleware, adminMiddleware, controller.validasi("matakuliah")],
  controller.matakuliah
);
router.get("/program", [authMiddleware, adminMiddleware], controller.program);
router.get("/pegawai", [authMiddleware, adminMiddleware], controller.pegawai);
router.get(
  "/ruang-kuliah",
  [authMiddleware, adminMiddleware],
  controller.ruangKuliah
);
router.get(
  "/soal",
  [authMiddleware, adminMiddleware, controller.validasi("soal")],
  controller.soal
);
router.get(
  "/soal-agama",
  [authMiddleware, adminMiddleware, controller.validasi("soal")],
  controller.soalAgama
);
router.get(
  "/kuliah-agama",
  [authMiddleware, adminMiddleware],
  controller.kuliahAgama
);
router.get(
  "/kuliah-agama-mahasiswa",
  [authMiddleware, adminMiddleware],
  controller.kuliahAgamaMahasiswa
);
router.get(
  "/kuliah-pararel",
  [authMiddleware, adminMiddleware, controller.validasi("kuliah_pararel")],
  controller.kuliahPararel
);
router.get(
  "/mahasiswa",
  [authMiddleware, adminMiddleware, controller.validasi("mahasiswa")],
  controller.mahasiswa
);
router.get(
  "/mahasiswa-semester",
  [authMiddleware, adminMiddleware, controller.validasi("mahasiswa_semester")],
  controller.mahasiswaSemester
);
router.get(
  "/detail-mahasiswa-semester",
  [
    authMiddleware,
    adminMiddleware,
    controller.validasi("detail_mahasiswa_semester"),
  ],
  controller.detailMahasiswaSemester
);

module.exports = router;
