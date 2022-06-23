const express = require("express");
const controller = require("../../controller/pengumuman");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");
const baakMiddleware = require("../../middleware/baak");
const upload = require("../../middleware/upload/file");

router.get(
  "/",
  [authMiddleware, controller.validasi("index")],
  controller.index
);
router.get(
  "/terbaru",
  [authMiddleware, controller.validasi("index")],
  controller.pengumumanTerbaru
);
router.post(
  "/",
  [authMiddleware, dosenMiddleware, controller.validasi("tambah")],
  controller.tambah
);
router.put(
  "/",
  [authMiddleware, dosenMiddleware, controller.validasi("edit")],
  controller.edit
);
router.delete(
  "/:nomor",
  [authMiddleware, dosenMiddleware, controller.validasi("hapus")],
  controller.hapus
);
router.post("/semua-pengumuman", [authMiddleware], controller.semuaPengumuman);

router.get(
  "/baak",
  [authMiddleware, baakMiddleware],
  controller.daftarPengumumanBaak
);
router.post(
  "/baak",
  [
    authMiddleware,
    baakMiddleware,
    upload.single("file"),
    controller.validasi("tambah_pengumuman_baak"),
  ],
  controller.tambahPengumuman
);
router.put(
  "/baak",
  [
    authMiddleware,
    baakMiddleware,
    upload.single("file"),
    controller.validasi("update_pengumuman_baak"),
  ],
  controller.updatePengumuman
);
router.delete(
  "/baak/:nomor",
  [authMiddleware, baakMiddleware, controller.validasi("hapus")],
  controller.hapusPengumuman
);
module.exports = router;
