const express = require("express");
const controller = require("../../controller/video");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");

router.get(
  "/",
  [authMiddleware, controller.validasi("index")],
  controller.index
);
router.get(
  "/by-nomor",
  [authMiddleware, controller.validasi("list_by_nomor")],
  controller.indexSingle
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
module.exports = router;
