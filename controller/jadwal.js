const DB = require("../config/db/oracle");
const JadwalRepository = require("../repository/jadwal");
const KuliahRepository = require("../repository/kuliah");
const konstanta = require("../helper/konstanta");
const { mahasiswa, dosen } = require("../helper/user");
const { body, param, query, validationResult } = require("express-validator");
const moment = require("moment");
moment.locale("id");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "semua_jadwal":
        return [query("tahun").notEmpty(), query("semester").notEmpty()];
      case "generate_jadwal":
        return [body("tahun").notEmpty(), body("semester").notEmpty()];
      case "jadwal_kuliah":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "jadwal_online":
        return [query("tahun").notEmpty(), query("semester").notEmpty()];
    }
  },
  listGenerateJadwal: async (req, res) => {
    const { tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await JadwalRepository.getJadwal(
      conn,
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  generateJadwal: async (req, res) => {
    const { tahun, semester } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const hapusJadwal = await JadwalRepository.hapusJadwal(
      conn,
      parseInt(tahun),
      parseInt(semester)
    );
    // console.log("hapusJadwal", hapusJadwal);
    const result = await JadwalRepository.getJadwal(
      conn,
      parseInt(tahun),
      parseInt(semester)
    );
    if (result.length != 0) {
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let menit = parseInt(element.jam_kali_50) * 50;

        // hari 1
        let tempConvertJamAwal_1 = "";
        let convertJamAkhir_1 = "";

        let jam_1 = element.jam_1;
        let hari_1 = element.hari_1;
        if (hari_1 != "" && hari_1 != null && jam_1 != "" && jam_1 != null) {
          if (hari_1.toString().length == 1) {
            let substrJamAwal1 = jam_1.substring(0, 5);
            tempConvertJamAwal_1 = moment(substrJamAwal1, "HH:mm");
            convertJamAkhir_1 = moment(tempConvertJamAwal_1)
              .add(menit, "minutes")
              .format("HH:mm");
            element.convertHari = element.hari_1;
            element.convertRuang = element.ruang_1;
            element.convertJamAwal = substrJamAwal1;
            element.convertJamAkhir = convertJamAkhir_1;
            await JadwalRepository.saveJadwal(conn, element, index);
          }
        }

        // hari 2
        let tempConvertJamAwal_2 = "";
        let convertJamAkhir_2 = "";

        let jam_2 = element.jam_2;
        let hari_2 = element.hari_2;
        if (hari_2 != "" && hari_2 != null && jam_2 != "" && jam_2 != null) {
          if (hari_2.toString().length == 1) {
            let substrJamAwal2 = jam_2.substring(0, 5);
            tempConvertJamAwal_2 = moment(substrJamAwal2, "HH:mm");
            convertJamAkhir_2 = moment(tempConvertJamAwal_2)
              .add(menit, "minutes")
              .format("HH:mm");
            element.convertHari = element.hari_2;
            element.convertRuang = element.ruang_2;
            element.convertJamAwal = substrJamAwal2;
            element.convertJamAkhir = convertJamAkhir_2;
            await JadwalRepository.saveJadwal(conn, element, index);
          }
        }
      }
      DB.closeConnection(conn);
      return res
        .status(200)
        .json({ sukses: true, pesan: "Data jadwal berhasil di generate" });
    } else {
      DB.closeConnection(conn);
      return res.json({
        sukses: false,
        pesan: "Data tidak tersedia",
      });
    }
  },
  index: async (req, res) => {
    const { tahun, semester, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const kdj = await JadwalRepository.getKuliahDosenJaga(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(jurusan),
      parseInt(program)
    );
    const wkdj = await JadwalRepository.getWaktuKuliahDosenJaga(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(jurusan),
      parseInt(program)
    );
    DB.closeConnection(conn);
    let result = [];
    if (kdj.length != 0) {
      for (let index = 0; index < kdj.length; index++) {
        const element = kdj[index];
        element.jadwal = [];
        if (wkdj.length != 0) {
          for (let index = 0; index < wkdj.length; index++) {
            const element_w = wkdj[index];
            if (element.kuliah == element_w.kuliah) {
              element.jadwal.push({
                hari: element_w.hari,
                nama_hari: element_w.nama_hari,
                jam_awal: element_w.jam_awal,
                jam_akhir: element_w.jam_akhir,
                ruang: element_w.room_meeting_id,
                nama_ruang: element_w.ruang,
                ket_ruang: element_w.ket_ruang,
              });
            }
          }
        }

        result.push(element);
      }
    }
    return res.status(200).json(result);
  },
  jadwalOnline: async (req, res) => {
    const { tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = [];
    if (dosen(req.user)) {
      result = await JadwalRepository.dosen(
        conn,
        parseInt(req.user.nomor),
        parseInt(tahun),
        parseInt(semester)
      );

      if (result.length != 0) {
        for (let index = 0; index < result.length; index++) {
          element = result[index];
          element.dataKuliahGabungan = [];
          if (element.isKuliahGabungan == true) {
            element.dataKuliahGabungan =
              await KuliahRepository.getKelasKuliahGabungan(
                conn,
                element.kuliahGabungan,
                element.jenis_schema
              );
          } else {
            element.dataKuliahGabungan = [];
          }
        }
      }
    } else if (mahasiswa(req.user)) {
      result = await JadwalRepository.mahasiswa(
        conn,
        parseInt(req.user.nomor),
        parseInt(tahun),
        parseInt(semester)
      );
    }
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
