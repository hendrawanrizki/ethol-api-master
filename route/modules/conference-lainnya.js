const express = require("express");
const controller = require("../../controller/conference-lainnya");
const { validasi } = require("../../controller/conference-lainnya");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");

router.get("/", [authMiddleware, validasi("index")], controller.index);
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
