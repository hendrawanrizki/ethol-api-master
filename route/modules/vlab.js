const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/auth");
const controller = require("../../controller/vlab");

router.get("/info-akun", [authMiddleware], controller.getUser);
module.exports = router;
