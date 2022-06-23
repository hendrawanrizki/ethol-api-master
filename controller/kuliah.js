const DB = require("../config/db/oracle");
const KuliahRepository = require("../repository/kuliah");
const konstanta = require("../helper/konstanta");
const { mahasiswa, dosen } = require("../helper/user");
const { query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "ambil":
        return [query("tahun").isNumeric(), query("semester").isNumeric()];
      case "peserta_kuliah":
        return [query("kuliah").isNumeric(), query("jenis_schema").isNumeric()];
    }
  },
  ambil: async (req, res) => {
    const { tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = [];
    if (dosen(req.user)) {
      result = await KuliahRepository.dosen(
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
                element.jenisSchema
              );
          } else {
            element.dataKuliahGabungan = [];
          }
        }
      }
    } else if (mahasiswa(req.user)) {
      result = await KuliahRepository.mahasiswa(
        conn,
        parseInt(req.user.nomor),
        parseInt(tahun),
        parseInt(semester)
      );
    }
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  ambilByKuliahJs: async (req, res) => {
    const { kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = [];
    if (dosen(req.user)) {
      result = await KuliahRepository.dosenByKuliahJs(
        conn,
        parseInt(req.user.nomor),
        parseInt(kuliah),
        parseInt(jenisSchema)
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
                element.jenisSchema
              );
          } else {
            element.dataKuliahGabungan = [];
          }
        }
      }
    } else if (mahasiswa(req.user)) {
      result = await KuliahRepository.mahasiswaByKuliahJs(
        conn,
        parseInt(req.user.nomor),
        parseInt(kuliah),
        parseInt(jenisSchema)
      );
    }
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  hariKuliahIn: async (req, res) => {
    const { kuliahs, tahun, semester } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await KuliahRepository.hariKuliahIn(
      conn,
      kuliahs,
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  pesertaKuliah: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let checkMahasiswa = mahasiswa(req.user);
    let result = await KuliahRepository.pesertaKuliah(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      checkMahasiswa
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
