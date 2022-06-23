const express = require("express");
const controller = require("../../controller/auth");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");
const router = express.Router();

router.get("/cas", controller.cas);
router.get("/validasi-token", authMiddleware, controller.validasiToken);
router.get("/config", authMiddleware, controller.appConfig);
// router.post("/dosen-lb", controller.dosenLB);
router.post("/dosen-lb", controller.dosenLBClient);
router.post(
  "/token-dosen-lb",
  [controller.validasi("tokenDosenLB")],
  controller.getTokenDosenLb
);
router.post(
  "/generate-token",
  [authMiddleware, adminMiddleware],
  controller.generateToken
);

module.exports = router;
