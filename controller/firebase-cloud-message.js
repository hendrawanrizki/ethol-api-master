const DB = require("../config/db/oracle");
const FCMRepository = require("../repository/firebase-cloud-message");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");
const waktu = require("../helper/waktu");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "updateToken":
        return [
          body("nomor").notEmpty(),
          body("fcmToken").notEmpty(),
          body("ua").notEmpty(),
          body("deviceType").notEmpty(),
          body("vendor").notEmpty(),
        ];
    }
  },
  updateTokenDosen: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { nomor, fcmToken, ua, deviceType, vendor } = { ...req.body };
    const ipAddresClient = req.clientIp;
    const conn = await DB.getConnection();
    let simpanToken;
    let cekDosen = await FCMRepository.cekDosen(
      conn,
      nomor,
      deviceType,
      vendor
    );
    if (cekDosen.length == 0) {
      simpanToken = await FCMRepository.simpanDosen(
        conn,
        parseInt(nomor),
        fcmToken,
        ua,
        deviceType,
        vendor,
        ipAddresClient,
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      for (let index = 0; index < cekDosen.length; index++) {
        const element = cekDosen[index];
        let nomorFCM = element.nomor;
        if (index == 0) {
          simpanToken = await FCMRepository.updateDosen(
            conn,
            parseInt(nomorFCM),
            fcmToken,
            ua,
            ipAddresClient,
            waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
          );
        } else {
          let hapusDosen = await FCMRepository.hapusDosen(
            conn,
            parseInt(nomorFCM)
          );
        }
      }
    }
    DB.closeConnection(conn);
    return res.status(simpanToken ? 201 : 200).json({
      success: simpanToken ? true : false,
      message: simpanToken
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  updateTokenMahasiswa: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { nomor, fcmToken, ua, deviceType, vendor } = { ...req.body };
    const ipAddresClient = req.clientIp;
    const conn = await DB.getConnection();
    let simpanToken;
    let cekMahasiswa = await FCMRepository.cekMahasiswa(
      conn,
      nomor,
      deviceType,
      vendor
    );
    if (cekMahasiswa.length == 0) {
      simpanToken = await FCMRepository.simpanMahasiswa(
        conn,
        parseInt(nomor),
        fcmToken,
        ua,
        deviceType,
        vendor,
        ipAddresClient,
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      for (let index = 0; index < cekMahasiswa.length; index++) {
        const element = cekMahasiswa[index];
        let nomorFCM = element.nomor;
        if (index == 0) {
          simpanToken = await FCMRepository.updateMahasiswa(
            conn,
            parseInt(nomorFCM),
            fcmToken,
            ua,
            ipAddresClient,
            waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
          );
        } else {
          let hapusMahasiswa = await FCMRepository.hapusMahasiswa(
            conn,
            parseInt(nomorFCM)
          );
        }
      }
    }
    DB.closeConnection(conn);
    return res.status(simpanToken ? 201 : 200).json({
      success: simpanToken ? true : false,
      message: simpanToken
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
};
