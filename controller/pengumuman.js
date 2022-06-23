const DB = require("../config/db/oracle");
const PengumumanRepository = require("../repository/pengumuman");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");
const waktu = require("../helper/waktu");
const File = require("../helper/file");
const path = require("path");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "index":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
      case "tambah":
        return [
          body("kuliah").notEmpty(),
          body("jenis_schema").notEmpty(),
          body("judul").notEmpty(),
          body("isi_pengumuman").notEmpty(),
        ];
      case "edit":
        return [
          body("judul").notEmpty(),
          body("isi_pengumuman").notEmpty(),
          body("nomor").notEmpty(),
        ];
      case "hapus":
        return [param("nomor").notEmpty()];
      case "tambah_pengumuman_baak":
        return [body("judul").notEmpty(), body("isi").notEmpty()];
      case "update_pengumuman_baak":
        return [
          body("nomor").notEmpty(),
          body("judul").notEmpty(),
          body("isi").notEmpty(),
        ];
    }
  },
  index: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.getData(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  pengumumanTerbaru: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.getPengumumanTerbaru(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const { kuliah, jenis_schema, judul, isi_pengumuman } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.tambahData(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      judul,
      isi_pengumuman
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
    const { judul, isi_pengumuman, nomor } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.editData(
      conn,
      judul,
      isi_pengumuman,
      parseInt(nomor)
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
    const result = await PengumumanRepository.hapusData(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
  semuaPengumuman: async (req, res) => {
    const { kuliahs } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await PengumumanRepository.semuaPengumuman(conn, kuliahs);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  daftarPengumumanBaak: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.getDataBaak(conn);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambahPengumuman: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { judul, isi } = { ...req.body };
    const file = req.file;
    let insert, savePath, saveFile;
    if (file) {
      let year = waktu.getTglSekarang("YYYY");
      const rename = file.originalname;
      const dir = path.join(
        __dirname,
        "../public/upload/information/" + year + "/"
      );
      savePath = "upload/information/" + year + "/" + rename;
      await File.createDir(dir);
      saveFile = await File.createFile(dir + rename, file.buffer);
    }
    const conn = await DB.getConnection();
    if (file && saveFile) {
      insert = await PengumumanRepository.tambahDataBaak(
        conn,
        judul,
        isi,
        savePath
      );
    }
    DB.closeConnection(conn);
    return res.status(insert && saveFile ? 201 : 200).json({
      sukses: insert && saveFile ? true : false,
      pesan:
        insert && saveFile
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  updatePengumuman: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { judul, isi, nomor } = { ...req.body };
    const file = req.file;
    let update, savePath, saveFile;
    if (file) {
      let year = waktu.getTglSekarang("YYYY");
      const rename = file.originalname;
      const dir = path.join(
        __dirname,
        "../public/upload/information/" + year + "/"
      );
      savePath = "upload/information/" + year + "/" + rename;
      await File.createDir(dir);
      saveFile = await File.createFile(dir + rename, file.buffer);
    }
    const conn = await DB.getConnection();
    if (file && saveFile) {
      update = await PengumumanRepository.updateDataBaak(
        conn,
        parseInt(nomor),
        judul,
        isi,
        savePath
      );
    } else {
      update = await PengumumanRepository.updateDataBaakNoFile(
        conn,
        parseInt(nomor),
        judul,
        isi
      );
    }
    DB.closeConnection(conn);
    return res.status(update ? 201 : 200).json({
      sukses: update ? true : false,
      pesan: update
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  hapusPengumuman: async (req, res) => {
    const { nomor } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PengumumanRepository.hapusDataBaak(
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
