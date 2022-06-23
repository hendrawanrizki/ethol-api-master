const DB = require("../config/db/oracle");
const HariRepository = require("../repository/hari");
const Konstanta = require("../helper/konstanta");
const { body, param, validationResult } = require("express-validator");
const waktu = require("../helper/waktu");
const waktuDatetime = require("../helper/datetime");

module.exports = {
  validasi: (method) => {},
  ambilSemua: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await HariRepository.ambilSemua(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },

  hariIni: async (req, res) => {
    return res.json({
      tanggal_sekarang: waktu.getTglSekarang(),
      tanggal_sekarang_yyyymmdd: waktu.getTglSekarang("YYYY-MM-DD"),
      tanggal_sekarang_format: waktu.getTglSekarang("DD MMMM YYYY"),
      tanggal_sekarang_format_dengan_hari:
        waktu.getTglSekarang("dddd, DD MMMM YYYY"),
      hari_sekarang: waktu.getTglSekarang("dddd"),
    });
  },
};
