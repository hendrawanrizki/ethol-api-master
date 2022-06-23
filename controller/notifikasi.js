const DB = require("../config/db/oracle");
const NotifikasiRepository = require("../repository/notifikasi");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list_notifikasi_mahasiswa":
        return [query("filterNotif").notEmpty()];
      case "notifikasi_by_id":
        return [query("idNotifikasi").notEmpty()];
      case "list_notifikasi_dosen":
        return [query("filterNotif").notEmpty()];
    }
  },
  indexMahasiswa: async (req, res) => {
    const { filterNotif } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await NotifikasiRepository.ambilNotifikasiMahasiswa(
      conn,
      parseInt(req.user.nomor),
      filterNotif
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  getNotifikasiMhsById: async (req, res) => {
    const { idNotifikasi } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    let success;
    let result;
    if (idNotifikasi.includes(req.user.nomor.toString()) == true) {
      success = true;
      const conn = await DB.getConnection();
      result = await NotifikasiRepository.getNotifikasiMhsSingle(
        conn,
        idNotifikasi
      );
      DB.closeConnection(conn);
    } else {
      success = false;
      result = [""];
    }
    return res.status(200).json({ success, ...result[0] });
  },
  jumlahNotifMahasiswa: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await NotifikasiRepository.jumlahNotifikasiMahasiswa(
      conn,
      parseInt(req.user.nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  bacaNotifikasiMahasiswa: async (req, res) => {
    const { idNotifikasi } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result = await NotifikasiRepository.bacaNotifMahasiswa(
      conn,
      idNotifikasi
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      success: result ? true : false,
      message: result
        ? "Berhasil menyimpan data !"
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  indexDosen: async (req, res) => {
    const { filterNotif } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await NotifikasiRepository.ambilNotifikasiDosen(
      conn,
      parseInt(req.user.nomor),
      filterNotif
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  getNotifikasiDosenById: async (req, res) => {
    const { idNotifikasi } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    let success;
    let result;
    if (idNotifikasi.includes(req.user.nomor.toString()) == true) {
      success = true;
      const conn = await DB.getConnection();
      result = await NotifikasiRepository.getNotifikasiDsnSingle(
        conn,
        idNotifikasi
      );
      DB.closeConnection(conn);
    } else {
      success = false;
      result = [""];
    }
    return res.status(200).json({ success, ...result[0] });
  },
  jumlahNotifDosen: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await NotifikasiRepository.jumlahNotifikasiDosen(
      conn,
      parseInt(req.user.nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  bacaNotifikasiDosen: async (req, res) => {
    const { idNotifikasi } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result = await NotifikasiRepository.bacaNotifDosen(conn, idNotifikasi);
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      success: result ? true : false,
      message: result
        ? "Berhasil menyimpan data !"
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
};
