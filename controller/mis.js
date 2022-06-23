const DB = require("../config/db/oracle");
const MisRepository = require("../repository/mis");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "kuliah":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "matakuliah":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "soal":
        return [
          query("jenis").notEmpty(),
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
        ];
      case "mahasiswa":
        return [
          query("angkatan").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "kuliah_pararel":
        return [
          query("hari").notEmpty(),
          query("jenis_schema").notEmpty(),
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
        ];
      case "mahasiswa_semester":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "detail_mahasiswa_semester":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
    }
  },
  agama: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.agama(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  hari: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.hari(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jam: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jam(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jamPjj: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jamPjj(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jamPsdku: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jamPsdku(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jamReg: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jamReg(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jenisSchema: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jenisSchema(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jurusan: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.jurusan(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  kelas: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.kelas(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  program: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.program(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  kuliah: async (req, res) => {
    const { tahun, semester, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.kuliah(
      conn,
      parseInt(semester),
      parseInt(tahun),
      parseInt(program),
      parseInt(jurusan)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  matakuliah: async (req, res) => {
    const { semester, tahun, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.matakuliah(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(program),
      parseInt(jurusan)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  pegawai: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.pegawai(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  ruangKuliah: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.ruangKuliah(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  soal: async (req, res) => {
    const { jenis, tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.soal(
      conn,
      parseInt(jenis),
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  kuliahAgama: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.kuliahAgama(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  kuliahAgamaMahasiswa: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await MisRepository.kuliahAgamaMahasiswa(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  mahasiswa: async (req, res) => {
    const { angkatan, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.mahasiswa(
      conn,
      parseInt(angkatan),
      parseInt(program),
      parseInt(jurusan)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  soalAgama: async (req, res) => {
    const { jenis, tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.soalAgama(
      conn,
      parseInt(jenis),
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },

  kuliahPararel: async (req, res) => {
    const { hari, jenis_schema, tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.kuliahPararel(
      conn,
      parseInt(hari),
      parseInt(jenis_schema),
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },

  mahasiswaSemester: async (req, res) => {
    const { tahun, semester, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.mahasiswaSemester(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(program),
      parseInt(jurusan)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },

  detailMahasiswaSemester: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await MisRepository.detailMahasiswaSemester(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
