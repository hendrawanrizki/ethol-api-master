const express = require("express");
const controller = require("../../controller/firebase-cloud-message");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const dosenMiddleware = require("../../middleware/dosen");
const mahasiswaMiddleware = require("../../middleware/mahasiswa");

router.post(
  "/token-dosen",
  [dosenMiddleware, controller.validasi("updateToken")],
  controller.updateTokenDosen
);
router.post(
  "/token-mahasiswa",
  [mahasiswaMiddleware, controller.validasi("updateToken")],
  controller.updateTokenMahasiswa
);
module.exports = router;
