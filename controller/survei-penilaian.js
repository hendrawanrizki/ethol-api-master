const DB = require("../config/db/oracle");
const SurveiRepository = require("../repository/survei-penilaian");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "simpan":
        return [
          body("fitur").notEmpty(),
          body("tipeConference").notEmpty(),
          body("ratingKepuasan").notEmpty(),
        ];
    }
  },
  index: async (req, res) => {
    let hakAkses = req.user.hakAkses[0];
    let nomor = req.user.nomor;
    let tipe;
    if (hakAkses == "dosen" || hakAkses == "baak" || hakAkses == "kaprodi") {
      tipe = 1;
    } else if (hakAkses == "mahasiswa") {
      tipe = 2;
    }
    const conn = await DB.getConnection();
    const result = await SurveiRepository.getData(conn, parseInt(nomor), tipe);
    DB.closeConnection(conn);
    let sudah_survei = false;
    if (result.jumlah != 0) {
      sudah_survei = true;
    }
    return res.status(200).json({ sudah_survei });
  },
  simpan: async (req, res) => {
    const { fitur, tipeConference, ratingKepuasan, saranMasukan } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }

    let fiturAbsensi = null;
    let fiturTugas = null;
    let fiturConference = null;
    let fiturMateri = null;
    let fiturVideo = null;
    for (let index = 0; index < fitur.length; index++) {
      const perfitur = fitur[index];
      if (perfitur == "Absensi") {
        fiturAbsensi = "1";
      } else if (perfitur == "Tugas") {
        fiturTugas = "1";
      } else if (perfitur == "Conference") {
        fiturConference = "1";
      } else if (perfitur == "Materi") {
        fiturMateri = "1";
      } else if (perfitur == "Video") {
        fiturVideo = "1";
      }
    }
    let hakAkses = req.user.hakAkses[0];
    let nomor = req.user.nomor;
    let tipe;
    if (hakAkses == "dosen" || hakAkses == "baak" || hakAkses == "kaprodi") {
      tipe = 1;
    } else if (hakAkses == "mahasiswa") {
      tipe = 2;
    }

    const conn = await DB.getConnection();
    const result = await SurveiRepository.simpanData(
      conn,
      parseInt(nomor),
      tipe,
      fiturAbsensi,
      fiturTugas,
      fiturConference,
      fiturMateri,
      fiturVideo,
      tipeConference,
      ratingKepuasan,
      saranMasukan
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
};
