const express = require("express");
const controller = require("../../controller/hari");
const router = express.Router();

router.get("/", controller.ambilSemua);
router.get("/today", controller.hariIni);

module.exports = router;
