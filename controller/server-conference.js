const DB = require("../config/db/oracle");
const ServerConferenceRepository = require("../repository/server-conference");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "tambah":
        return [body("nama").notEmpty(), body("url").notEmpty()];
      case "edit":
        return [
          body("nomor").notEmpty(),
          body("nama").notEmpty(),
          body("url").notEmpty(),
        ];
      case "hapus":
        return [param("nomor").notEmpty()];
    }
  },
  index: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await ServerConferenceRepository.getData(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const { nama, url } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await ServerConferenceRepository.tambahData(conn, nama, url);
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  edit: async (req, res) => {
    const { nomor, nama, url } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await ServerConferenceRepository.editData(
      conn,
      parseInt(nomor),
      nama,
      url
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIUBAH
        : konstanta.DATA_GAGAL_DIUBAH,
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
    const result = await ServerConferenceRepository.hapusData(
      conn,
      parseInt(nomor)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
};
