const DB = require("../config/db/oracle");
const PegawaiRepository = require("../repository/pegawai");
const MahasiswaRepository = require("../repository/mahasiswa");
const AppConfigRepository = require("../repository/app-config");
const { HAK_AKSES, ELISTA, ADMIN_ETHOL } = require("../helper/konstanta");
const { body, validationResult, query } = require("express-validator");
const { formatNamaPegawai } = require("../helper/format");
const jwt = require("jsonwebtoken");
const konstanta = require("../helper/konstanta");
const axios = require("axios");

const kategoriAkses = function (staff) {
  let hakAkses;
  HAK_AKSES.forEach((item) => {
    if (item.staff === staff) {
      hakAkses = item.hakAkses;
    }
  });
  return hakAkses;
};

const cekElista = function (email) {
  let nomor;
  ELISTA.forEach((item) => {
    if (item.email === email) {
      nomor = item.nomor;
    }
  });
  return nomor;
};

const cekAdmin = function (email) {
  return ADMIN_ETHOL.includes(email);
};

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "cas":
        return [query("email").isEmail()];
      case "dosenLB":
        return [body("username").isEmpty(), body("password").isEmpty()];
      case "tokenDosenLB":
        return [body("username").notEmpty(), body("password").notEmpty()];
      case "generateToken":
        return [
          body("nomor").isNumeric(),
          body("nama").isEmpty(),
          body("nipnrp").isEmpty(),
          body("hakAkses").isEmpty(),
        ];
    }
  },
  validasiToken: async (req, res) => {
    return res.status(200).json(req.user);
  },
  generateToken: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    return res.status(200).json({
      sukses: true,
      pesan: "Token berhasil digenerate",
      token: jwt.sign({ ...req.body }, process.env.SECRET_KEY),
    });
  },
  cas: async (req, res) => {
    const { email, nrp, nip } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const elista = cekElista(email);
    let result;
    const hakAkses = [];
    if (elista) {
      const pegawai = await PegawaiRepository.ambilBerdasarkanNomor(
        conn,
        elista
      );
      if (cekAdmin(email)) {
        hakAkses.push("admin");
        hakAkses.push("baak");
      }
      result = {
        nomor: pegawai.nomor,
        nipnrp: pegawai.nip,
        nama: formatNamaPegawai(
          pegawai.gelarDpn,
          pegawai.nama,
          pegawai.gelarBlk
        ),
        hakAkses,
      };
    } else if (nip) {
      const pegawai = await PegawaiRepository.ambilBerdasarkanNip(conn, nip);
      const hakAkses = [];
      hakAkses.push(kategoriAkses(pegawai.staff));
      if (cekAdmin(email)) {
        hakAkses.push("admin");
        hakAkses.push("baak");
      }
      const kaprodi = await PegawaiRepository.kaprodi(conn, pegawai.nomor);
      if (kaprodi) {
        hakAkses.push("kaprodi");
      }
      result = {
        nomor: pegawai.nomor,
        nipnrp: pegawai.nip,
        nama: formatNamaPegawai(
          pegawai.gelarDpn,
          pegawai.nama,
          pegawai.gelarBlk
        ),
        hakAkses,
      };
    } else if (nrp) {
      const mahasiswa = await MahasiswaRepository.ambilBerdasarkanNrp(
        conn,
        nrp
      );
      result = {
        nomor: mahasiswa.nomor,
        nipnrp: mahasiswa.nrp,
        nama: mahasiswa.nama,
        hakAkses: ["mahasiswa"],
      };
    }

    DB.closeConnection(conn);
    return res
      .status(200)
      .json({ ...result, token: jwt.sign(result, process.env.SECRET_KEY) });
  },
  dosenLB: async (req, res) => {
    let result;
    const { username, password } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const pegawai = await PegawaiRepository.ambilBerdasarkanUsername(
      conn,
      username
    );
    DB.closeConnection(conn);
    if (pegawai) {
      // const agent = new https.Agent({
      //   rejectUnauthorized: false,
      // });
      const cekPassword = await axios
        .get(
          `https://ethol.pens.ac.id/auth-php/login.php?hash=${pegawai.password}&password=${password}`
          // { httpsAgent: agent }
        )
        .then((res) => res.data.success)
        .catch((err) => {
          console.log(err);
          return false;
        });
      if (cekPassword) {
        result = {
          nomor: pegawai.nomor,
          nipnrp: pegawai.nip,
          nama: formatNamaPegawai(
            pegawai.gelarDpn,
            pegawai.nama,
            pegawai.gelarBlk
          ),
          hakAkses: ["dosen"],
        };
        return res
          .status(200)
          .json({ ...result, token: jwt.sign(result, process.env.SECRET_KEY) });
      } else {
        return res.status(200).json({
          sukses: false,
          pesan:
            "Password anda salah, mohon cek kembali password yang anda masukkan",
        });
      }
    } else {
      return res.status(200).json({
        sukses: false,
        pesan:
          "Akun tidak ditemukan, silahkan cek kembali username dan password anda",
      });
    }
  },
  dosenLBClient: async (req, res) => {
    let result;
    const { username, password } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const pegawai = await PegawaiRepository.ambilBerdasarkanUsername(
      conn,
      username
    );
    DB.closeConnection(conn);
    if (pegawai) {
      return res.status(200).json({
        status: "ditemukan",
        dataUser: pegawai,
      });
    } else {
      return res.status(200).json({
        status: "tidak-ditemukan",
        pesan:
          "Akun tidak ditemukan, silahkan cek kembali username dan password anda",
      });
    }
  },
  getTokenDosenLb: async (req, res) => {
    const { username, password } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const pegawai = await PegawaiRepository.ambilBerdasarkanUsernamePassword(
      conn,
      username,
      password
    );
    DB.closeConnection(conn);
    if (pegawai) {
      result = {
        nomor: pegawai.nomor,
        nipnrp: pegawai.nip,
        nama: formatNamaPegawai(
          pegawai.gelarDpn,
          pegawai.nama,
          pegawai.gelarBlk
        ),
        hakAkses: ["dosen"],
      };
      return res
        .status(200)
        .json({ ...result, token: jwt.sign(result, process.env.SECRET_KEY) });
    } else {
      return res.status(200).json({
        status: "tidak-ditemukan",
        pesan:
          "Akun tidak ditemukan, silahkan cek kembali username dan password anda",
      });
    }
  },
  appConfig: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await AppConfigRepository.ambilConfig(conn);
    let datanya;
    if (result.length == 1) {
      datanya = {
        success: true,
        ...result[0],
      };
    } else {
      datanya = {
        success: false,
      };
    }
    DB.closeConnection(conn);
    return res.status(200).json(datanya);
  },
};
