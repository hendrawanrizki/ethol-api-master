const DB = require("../config/db/oracle");
const SupportRepository = require("../repository/support");
const konstanta = require("../helper/konstanta");
const {
  body,
  param,
  query,
  validationResult,
  check,
} = require("express-validator");
const File = require("../helper/file");
const waktu = require("../helper/waktu");
const path = require("path");
const { stat } = require("fs");
module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list":
        return [query("hakAkses").notEmpty()];
      case "nama":
        return [query("nomor").notEmpty()];
      case "buat":
        return [body("judul").notEmpty(), body("tipeAkses").notEmpty()];
      case "add_baak":
        return [body("nomorSupport").notEmpty()];
      case "balas":
        return [
          body("deskripsi").notEmpty(),
          body("tipeAkses").notEmpty(),
          body("nomorSupport").notEmpty(),
        ];
      case "tandai_selesai":
        return [body("nomorSupport").notEmpty()];
      case "lampiran":
        return [query("nomor").notEmpty()];
      case "list_balasan":
        return [query("nomor").notEmpty()];
      case "nonaktif":
        return [param("nomor").notEmpty()];
      case "hapus_baak":
        return [param("nomor").notEmpty()];
    }
  },
  index: async (req, res) => {
    const { hakAkses } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }

    let nomor = req.user.nomor;
    const conn = await DB.getConnection();
    const result = await SupportRepository.getData(
      conn,
      parseInt(nomor),
      hakAkses
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexAdmin: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await SupportRepository.getDataAdmin(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexBaak: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await SupportRepository.getDataBaak(
      conn,
      parseInt(req.user.nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  akunBaak: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await SupportRepository.getAkunBaak(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  getLampiran: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await SupportRepository.getLampiran(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  nama: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const cekData = await SupportRepository.getDataByNomor(
      conn,
      parseInt(nomor)
    );
    let result;

    if (cekData.ditemukan == true) {
      let nomorUser = cekData.nomorUser;
      let tipe = cekData.tipe;

      if (tipe == "mahasiswa") {
        result = await SupportRepository.getPengirimMahasiswa(
          conn,
          parseInt(nomorUser),
          tipe
        );
      } else {
        result = await SupportRepository.getPengirimPegawai(
          conn,
          parseInt(nomorUser),
          tipe
        );
      }

      if (result.ditemukan == true) {
        result.sukses = true;
        result.pesan = "Data ditemukan !";
        result.status = cekData.status;
        result.ketStatus = cekData.ketStatus;
      } else {
        result.pesan = "Data tidak ditemukan !";
        result.sukses = false;
        result.status = cekData.status;
        result.ketStatus = cekData.ketStatus;
      }
    } else {
      result = {
        sukses: false,
        pesan: "Pengirim tidak ditemukan !",
      };
    }

    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  buat: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { judul, deskripsi, lampiran, tipeAkses } = {
      ...req.body,
    };
    const ip_address_client =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let insert;
    const conn = await DB.getConnection();
    let idSupport = await SupportRepository.getSequenceSupport(conn);
    insert = await SupportRepository.simpanSupport(
      conn,
      judul,
      deskripsi.replace(
        "<script>",
        "<b><i>script tag tidak diizinkan</i></b> "
      ),
      parseInt(req.user.nomor),
      tipeAkses,
      ip_address_client
    );

    // upload lampiran
    let year = waktu.getTglSekarang("YYYY");
    let month = waktu.getTglSekarang("MM");
    let day = waktu.getTglSekarang("DD");
    for (let index = 0; index < lampiran.length; index++) {
      const l = lampiran[index];
      // upload file tugas
      const dir = path.join(
        __dirname,
        "../public/upload/support/" + year + "/" + month + "/" + day + "/"
      );
      await File.createDir(dir);
      uploadGetPath = await File.createFileBase64(
        "public/upload/support/" + year + "/" + month + "/" + day + "/",
        "upload/support/" + year + "/" + month + "/" + day + "/",
        l.file_base_64,
        l.extensi_file,
        l.original_name
      );

      insert = await SupportRepository.simpanSupportLampiran(
        conn,
        idSupport,
        uploadGetPath,
        l.extensi_file
      );
    }
    //end upload lampiran

    DB.closeConnection(conn);
    return res.status(insert ? 201 : 200).json({
      sukses: insert ? true : false,
      pesan: insert
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  balas: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { deskripsi, lampiran, tipeAkses, nomorSupport } = {
      ...req.body,
    };
    const ip_address_client =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let insert;
    const conn = await DB.getConnection();
    let idSupportJawaban = await SupportRepository.getSequenceSupportJawaban(
      conn
    );
    insert = await SupportRepository.simpanSupportJawaban(
      conn,
      nomorSupport,
      deskripsi.replace(
        "<script>",
        "<b><i>script tag tidak diizinkan</i></b> "
      ),
      parseInt(req.user.nomor),
      tipeAkses,
      ip_address_client
    );

    // upload lampiran
    let year = waktu.getTglSekarang("YYYY");
    let month = waktu.getTglSekarang("MM");
    let day = waktu.getTglSekarang("DD");
    for (let index = 0; index < lampiran.length; index++) {
      const l = lampiran[index];
      // upload file tugas
      const dir = path.join(
        __dirname,
        "../public/upload/support_balasan/" +
          year +
          "/" +
          month +
          "/" +
          day +
          "/"
      );
      await File.createDir(dir);
      uploadGetPath = await File.createFileBase64(
        "public/upload/support_balasan/" + year + "/" + month + "/" + day + "/",
        "upload/support_balasan/" + year + "/" + month + "/" + day + "/",
        l.file_base_64,
        l.extensi_file,
        l.original_name
      );

      insert = await SupportRepository.simpanSupportJawabanLampiran(
        conn,
        idSupportJawaban,
        uploadGetPath,
        l.extensi_file
      );
    }
    //end upload lampiran

    // update status
    const cekData = await SupportRepository.getDataByNomor(
      conn,
      parseInt(nomorSupport)
    );
    if (cekData.ditemukan == true) {
      let status = "1";
      if (
        cekData.nomorUser == parseInt(req.user.nomor) &&
        cekData.tipe == tipeAkses
      ) {
        status = "3";
      } else {
        status = "2";
      }
      let update = await SupportRepository.updateStatusSupport(
        conn,
        nomorSupport,
        status
      );
    }
    // end update status

    DB.closeConnection(conn);
    return res.status(insert ? 201 : 200).json({
      sukses: insert ? true : false,
      pesan: insert
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  getBalasan: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await SupportRepository.getBalasan(conn, parseInt(nomor));
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      element.lampiran = [];
      element.lampiran = await SupportRepository.getBalasanLampiran(
        conn,
        element.nomor
      );
    }
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  nonaktif: async (req, res) => {
    const { nomor } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result;
    // update status
    const cekData = await SupportRepository.getDataByNomor(
      conn,
      parseInt(nomor)
    );
    if (cekData.ditemukan == true) {
      if (cekData.nomorUser == parseInt(req.user.nomor)) {
        result = await SupportRepository.updateStatusSupport(conn, nomor, "0");
      }
    }
    // end update status
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
  addBaak: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { nomorSupport, baak } = {
      ...req.body,
    };
    const conn = await DB.getConnection();
    if (baak.length != 0) {
      for (let index = 0; index < baak.length; index++) {
        const noBaak = baak[index];
        const checkBaak = await SupportRepository.jumlahBaak(
          conn,
          parseInt(nomorSupport),
          parseInt(noBaak)
        );
        let insert;
        if (checkBaak.jumlah == 0) {
          insert = await SupportRepository.simpanSupportBaak(
            conn,
            parseInt(nomorSupport),
            parseInt(noBaak)
          );
        }
      }
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: true,
        pesan: "Berhasil Menambahkan BAAK !",
      });
    } else {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan: "Harap masukkan BAAK yang dipilih !",
      });
    }
  },
  daftarBaakYangIkut: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await SupportRepository.getSupportBaak(
      conn,
      parseInt(nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  hapusBaak: async (req, res) => {
    const { nomor } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result = await SupportRepository.hapusBaak(conn, nomor);
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
  tandaiSelesai: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { nomorSupport } = {
      ...req.body,
    };
    const conn = await DB.getConnection();
    let update = await SupportRepository.updateStatusSupportSelesai(
      conn,
      nomorSupport
    );

    DB.closeConnection(conn);
    return res.status(update ? 201 : 200).json({
      sukses: update ? true : false,
      pesan: update
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
};
