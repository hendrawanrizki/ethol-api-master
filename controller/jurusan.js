const DB = require("../config/db/oracle");
const JurusanRepository = require("../repository/jurusan");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "detail":
        return [query("nomor").notEmpty()];
    }
  },
  index: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await JurusanRepository.getJurusan(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  detailJurusan: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await JurusanRepository.detailJurusan(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
