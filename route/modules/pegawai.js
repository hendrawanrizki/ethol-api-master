const express = require("express");
const controller = require("../../controller/pegawai");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/admin");

router.get("/dosen-pens", [authMiddleware], controller.dosen);
module.exports = router;
