const express = require("express");
const auth = require("./modules/auth");
const coba = require("./modules/coba");
const hari = require("./modules/hari");
const mis = require("./modules/mis");
const presensi = require("./modules/presensi");
const program = require("./modules/program");
const jurusan = require("./modules/jurusan");
const jadwal = require("./modules/jadwal");
const kuliah = require("./modules/kuliah");
const libur = require("./modules/libur");
const pegawai = require("./modules/pegawai");
const materi = require("./modules/materi");
const serverConference = require("./modules/server-conference");
const roomConference = require("./modules/room-conference");
const video = require("./modules/video");
const pengumuman = require("./modules/pengumuman");
const tugas = require("./modules/tugas");
const conferenceLainnya = require("./modules/conference-lainnya");
const ujian = require("./modules/ujian");
const v1 = require("./modules/v1");
const vlab = require("./modules/vlab");
const surveiPenilaian = require("./modules/survei-penilaian");
const support = require("./modules/support");
const fcm = require("./modules/fcm");
const notifikasi = require("./modules/notifikasi");
const forum = require("./modules/forum");

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({
    message: "Selamat datang di ETHOL REST-API v2 ",
  });
});
router.use("/auth", auth);
router.use("/hari", hari);
router.use("/coba", coba);
router.use("/mis", mis);
router.use("/presensi", presensi);
router.use("/program", program);
router.use("/jurusan", jurusan);
router.use("/kuliah", kuliah);
router.use("/server-conference", serverConference);
router.use("/room-conference", roomConference);
router.use("/jadwal", jadwal);
router.use("/libur", libur);
router.use("/materi", materi);
router.use("/video", video);
router.use("/pengumuman", pengumuman);
router.use("/tugas", tugas);
router.use("/conference-lainnya", conferenceLainnya);
router.use("/ujian", ujian);
router.use("/v1", v1);
router.use("/vlab", vlab);
router.use("/pegawai", pegawai);
router.use("/survei-penilaian", surveiPenilaian);
router.use("/support", support);
router.use("/fcm", fcm);
router.use("/notifikasi", notifikasi);
router.use("/forum", forum);

module.exports = router;
