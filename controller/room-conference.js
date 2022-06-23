const DB = require("../config/db/oracle");
const RoomConferenceRepository = require("../repository/room-conference");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "detail":
        return [query("nomor").notEmpty()];
      case "tambah":
        return [body("nama").notEmpty(), body("server").notEmpty()];
      case "edit":
        return [
          body("nama").notEmpty(),
          body("server").notEmpty(),
          body("nomor").notEmpty(),
        ];
      case "hapus":
        return [param("nomor").notEmpty()];
    }
  },
  index: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await RoomConferenceRepository.getData(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexUmum: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await RoomConferenceRepository.getDataUmum(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  detail: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await RoomConferenceRepository.detail(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const { nomor, nama, server } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await RoomConferenceRepository.tambahData(
      conn,
      parseInt(nomor),
      nama,
      1,
      parseInt(server)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  edit: async (req, res) => {
    const { nama, server, nomor, nomorAsli } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await RoomConferenceRepository.editData(
      conn,
      nama,
      parseInt(server),
      parseInt(nomor),
      parseInt(nomorAsli)
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
    const result = await RoomConferenceRepository.hapusData(
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
