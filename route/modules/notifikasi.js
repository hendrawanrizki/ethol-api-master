const express = require("express");
const controller = require("../../controller/notifikasi");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");
const dosenMiddleware = require("../../middleware/dosen");
const upload = require("../../middleware/upload/file");

router.get(
  "/mahasiswa",
  [
    authMiddleware,
    mahasiswaMiddleware,
    controller.validasi("list_notifikasi_mahasiswa"),
  ],
  controller.indexMahasiswa
);
router.get(
  "/mahasiswa-belum-baca",
  [authMiddleware, mahasiswaMiddleware],
  controller.jumlahNotifMahasiswa
);
router.put(
  "/mahasiswa-baca-notif",
  [authMiddleware, mahasiswaMiddleware],
  controller.bacaNotifikasiMahasiswa
);
router.get(
  "/mahasiswa-by-id",
  [
    authMiddleware,
    mahasiswaMiddleware,
    controller.validasi("notifikasi_by_id"),
  ],
  controller.getNotifikasiMhsById
);
router.get(
  "/dosen",
  [
    authMiddleware,
    dosenMiddleware,
    controller.validasi("list_notifikasi_dosen"),
  ],
  controller.indexDosen
);
router.get(
  "/dosen-belum-baca",
  [authMiddleware, dosenMiddleware],
  controller.jumlahNotifDosen
);
router.put(
  "/dosen-baca-notif",
  [authMiddleware, dosenMiddleware],
  controller.bacaNotifikasiDosen
);
router.get(
  "/dosen-by-id",
  [authMiddleware, dosenMiddleware, controller.validasi("notifikasi_by_id")],
  controller.getNotifikasiDosenById
);

module.exports = router;
