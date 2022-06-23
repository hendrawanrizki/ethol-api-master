const express = require("express");
const controller = require("../../controller/presensi");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const baakMiddleware = require("../../middleware/baak");
const dosenMiddleware = require("../../middleware/dosen");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");

router.get(
  "/admin",
  [
    authMiddleware,
    adminMiddleware,
    controller.validasi("rekap_presensi_admin_baak"),
  ],
  controller.rekapPresensi
);
router.get(
  "/baak",
  [
    authMiddleware,
    baakMiddleware,
    controller.validasi("rekap_presensi_admin_baak"),
  ],
  controller.rekapPresensi
);
router.get(
  "/dosen",
  [
    authMiddleware,
    dosenMiddleware,
    controller.validasi("rekap_presensi_dosen"),
  ],
  controller.rekapPresensiDosen
);
router.get(
  "/get-tanggal-presensi-dosen-per-bulan",
  [authMiddleware, controller.validasi("tanggal_presensi_dosen_per_bulan")],
  controller.tanggalPresensiDosenPerBulan
);
router.get(
  "/get-tanggal-presensi-dosen-per-semester",
  [authMiddleware, controller.validasi("tanggal_presensi_dosen_per_semester")],
  controller.tanggalPresensiDosenPerSemester
);
router.get(
  "/jumlah-mahasiswa-per-kuliah",
  [authMiddleware, controller.validasi("jumlah_mahasiswa_per_kuliah")],
  controller.jumlahMahasiswaPerKuliah
);
router.get(
  "/daftar-mahasiswa-hadir-kuliah",
  [authMiddleware, controller.validasi("daftar_mahasiswa_hadir_kuliah")],
  controller.daftarMahasiswaHadirKuliah
);
router.get(
  "/daftar-mahasiswa-tidak-hadir-kuliah",
  [authMiddleware, controller.validasi("daftar_mahasiswa_tidak_hadir_kuliah")],
  controller.daftarMahasiswaTidakHadirKuliah
);
router.get(
  "/riwayat",
  [authMiddleware, controller.validasi("history_presensi")],
  controller.historyPresensi
);
router.get(
  "/aktif-kuliah",
  [authMiddleware, controller.validasi("aktifKuliah")],
  controller.aktifKuliah
);
router.get(
  "/aktif-dosen",
  [dosenMiddleware, controller.validasi("aktifDosen")],
  controller.aktifDosen
);
router.get(
  "/terakhir-kuliah",
  [authMiddleware, controller.validasi("terakhirKuliah")],
  controller.terakhirKuliah
);
router.post(
  "/buka",
  [dosenMiddleware, controller.validasi("buka")],
  controller.buka
);
router.post(
  "/mahasiswa",
  [mahasiswaMiddleware, controller.validasi("mahasiswa")],
  controller.mahasiswa
);
router.post(
  "/mahasiswa-mode-admin",
  [adminMiddleware, controller.validasi("mahasiswa")],
  controller.mahasiswaModeAdmin
);
router.post(
  "/mahasiswa-mode-baak",
  [baakMiddleware, controller.validasi("mahasiswa")],
  controller.mahasiswaModeAdmin
);

router.put(
  "/tutup",
  [dosenMiddleware, controller.validasi("tutup")],
  controller.tutup
);
router.put(
  "/batalkan",
  [dosenMiddleware, controller.validasi("batalkan")],
  controller.batalkan
);

module.exports = router;
