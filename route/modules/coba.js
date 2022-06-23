const express = require("express");
const controller = require("../../controller/coba");
const router = express.Router();

router.get("/tgl-sekarang", controller.tglSekarang);
router.get("/tes", controller.tes);
// router.get("/query", controller.query);

module.exports = router;
