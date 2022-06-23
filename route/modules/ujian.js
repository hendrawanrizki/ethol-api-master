const express = require("express");
const controller = require("../../controller/ujian");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const baakMiddleware = require("../../middleware/baak");
const dosenMiddleware = require("../../middleware/dosen");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");
const upload = require("../../middleware/upload/file");

router.get(
  "/",
  [authMiddleware, adminMiddleware, controller.validasi("list_admin")],
  controller.index
);
router.get(
  "/baak",
  [authMiddleware, baakMiddleware, controller.validasi("list_admin")],
  controller.index
);
router.post(
  "/submit",
  [
    authMiddleware,
    mahasiswaMiddleware,
    upload.single("file"),
    controller.validasi("submit"),
  ],
  controller.submit
);
router.put(
  "/jadwal-admin",
  [authMiddleware, adminMiddleware, controller.validasi("edit_jadwal")],
  controller.editJadwal
);
router.put(
  "/jadwal-baak",
  [authMiddleware, baakMiddleware, controller.validasi("edit_jadwal")],
  controller.editJadwal
);
router.post(
  "/jadwal-admin",
  [authMiddleware, adminMiddleware, controller.validasi("tambah_jadwal")],
  controller.tambahJadwal
);
router.post(
  "/jadwal-baak",
  [authMiddleware, baakMiddleware, controller.validasi("tambah_jadwal")],
  controller.tambahJadwal
);
router.put(
  "/jadwal-dosen",
  [authMiddleware, dosenMiddleware, controller.validasi("edit_jadwal_dosen")],
  controller.editJadwalDosen
);
router.put(
  "/tanggal-admin",
  [authMiddleware, adminMiddleware, controller.validasi("edit_tanggal")],
  controller.editTanggal
);
router.put(
  "/tanggal-baak",
  [authMiddleware, baakMiddleware, controller.validasi("edit_tanggal")],
  controller.editTanggal
);
router.put(
  "/dosen-admin",
  [authMiddleware, adminMiddleware, controller.validasi("edit_dosen")],
  controller.editDosen
);
router.put(
  "/dosen-baak",
  [authMiddleware, baakMiddleware, controller.validasi("edit_dosen")],
  controller.editDosen
);
router.post(
  "/generate-jadwal-by-filter",
  [authMiddleware, adminMiddleware, controller.validasi("generate_jadwal")],
  controller.generateJadwal
);
router.post(
  "/delete-jadwal-by-filter",
  [authMiddleware, adminMiddleware, controller.validasi("generate_jadwal")],
  controller.hapusJadwal
);
router.post(
  "/tarik-soal-ujian",
  [authMiddleware, adminMiddleware, controller.validasi("tarik_soal")],
  controller.tarikSoalUjian
);
router.post(
  "/tarik-soal-ujian-baak",
  [authMiddleware, baakMiddleware, controller.validasi("tarik_soal")],
  controller.tarikSoalUjian
);

router.get(
  "/daftar-ujian",
  [authMiddleware, controller.validasi("daftar_ujian")],
  controller.daftarUjian
);
router.get(
  "/daftar-ujian-single",
  [authMiddleware, controller.validasi("daftar_ujian_single")],
  controller.getDaftarUjianDosenWithNomorUjian
);
router.get(
  "/detail-ujian",
  [authMiddleware, controller.validasi("detail_ujian")],
  controller.detailUjian
);

router.get(
  "/hasil-ujian",
  [authMiddleware, dosenMiddleware, controller.validasi("hasil_ujian")],
  controller.hasilUjian
);
router.post(
  "/cek-soal",
  [authMiddleware, mahasiswaMiddleware, controller.validasi("cek_soal")],
  controller.cekSoal
);
router.post(
  "/cek-soal-dosen",
  [authMiddleware, dosenMiddleware, controller.validasi("cek_soal")],
  controller.cekSoal
);
router.post(
  "/cek-soal-agama",
  [authMiddleware, mahasiswaMiddleware, controller.validasi("cek_soal")],
  controller.cekSoalAgama
);
router.get(
  "/jawaban",
  [authMiddleware, mahasiswaMiddleware, controller.validasi("jawaban")],
  controller.jawaban
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
router.get(
  "/cari-kuliah-admin",
  [authMiddleware, adminMiddleware, controller.validasi("cari_kuliah")],
  controller.cariKuliah
);
router.get(
  "/cari-kuliah-baak",
  [authMiddleware, baakMiddleware, controller.validasi("cari_kuliah")],
  controller.cariKuliah
);

module.exports = router;
