const DB = require("../config/db/oracle");
const LiburRepository = require("../repository/libur");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "tambah":
        return [body("tanggal").notEmpty()];
      case "hapus":
        return [param("nomor").notEmpty()];
    }
  },
  index: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await LiburRepository.ambilSemua(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const { tanggal } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await LiburRepository.tambahData(conn, tanggal);
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  hapus: async (req, res) => {
    const { nomor } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await LiburRepository.hapusData(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
};
