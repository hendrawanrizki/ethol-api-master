const DB = require("../config/db/oracle");
const PegawaiRepository = require("../repository/pegawai");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
    }
  },
  dosen: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await PegawaiRepository.dosen(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
