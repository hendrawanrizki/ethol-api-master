const DB = require("../config/db/oracle");
const VlabRepository = require("../repository/vlab");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "check_auth":
        return [query("key_vlab").notEmpty()];
    }
  },
  getUser: async (req, res) => {
    const { key_vlab } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    if (key_vlab == "etholv2-vlab") {
      if (req.user.hakAkses.length == 1) {
        const conn = await DB.getConnection();
        if (
          req.user.hakAkses[0] == "dosen" ||
          req.user.hakAkses[0] == "mahasiswa"
        ) {
          let result;
          if (req.user.hakAkses[0] == "mahasiswa") {
            result = await VlabRepository.mahasiswa(
              conn,
              parseInt(req.user.nipnrp)
            );
          } else if (req.user.hakAkses[0] == "dosen") {
            result = await VlabRepository.dosen(conn, req.user.nipnrp);
          }
          if (result.length == 1) {
            return res.status(200).json({ sukses: true, ...result[0] });
          } else {
            return res.status(200).json({
              sukses: false,
              pesan: "Akses Anda tidak diperbolehkan mengakses vlab",
            });
          }
        } else {
          return res.status(200).json({
            sukses: false,
            pesan: "Akses Anda tidak diperbolehkan mengakses vlab",
          });
        }
      } else {
        return res.status(200).json({
          sukses: false,
          pesan: "Akses Anda tidak diperbolehkan mengakses vlab",
        });
      }
    } else {
      return res.status(200).json({ sukses: false, pesan: "Key Tidak Valid" });
    }
  },
};
