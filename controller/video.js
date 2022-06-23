const DB = require("../config/db/oracle");
const VideoRepository = require("../repository/video");
const konstanta = require("../helper/konstanta");
const MahasiswaRepository = require("../repository/mahasiswa");
const NotifikasiRepository = require("../repository/notifikasi");
const { v4: uuidv4 } = require("uuid");
const { body, param, query, validationResult } = require("express-validator");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "index":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
      case "list_by_nomor":
        return [query("nomorVideo").notEmpty()];
      case "tambah":
        return [
          body("kuliah").notEmpty(),
          body("jenis_schema").notEmpty(),
          body("judul").notEmpty(),
          body("url").notEmpty(),
        ];
      case "edit":
        return [
          body("judul").notEmpty(),
          body("url").notEmpty(),
          body("nomor").notEmpty(),
        ];
      case "hapus":
        return [param("nomor").notEmpty()];
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
    const result = await VideoRepository.getData(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexSingle: async (req, res) => {
    const { nomorVideo } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await VideoRepository.getDataVideoByNomor(
      conn,
      parseInt(nomorVideo)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const { kuliah, jenis_schema, judul, url, namaMk } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const insert = await VideoRepository.tambahData(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      judul,
      url
    );
    DB.closeConnection(conn);

    // START NOTIFIKASI
    if (insert.sukses == true) {
      const conn = await DB.getConnection();
      const idK = parseInt(kuliah);
      const jenisSchema = parseInt(jenis_schema);
      const namaMatakuliah = namaMk;

      let mahasiswas = await MahasiswaRepository.nomorMahasiswa(
        conn,
        parseInt(idK),
        parseInt(jenisSchema)
      );
      let idNotifikasi = uuidv4();
      let keterangan =
        "Dosen telah mengunggah video baru untuk matakuliah " +
        namaMatakuliah +
        " dengan judul " +
        judul;
      for (let indexM = 0; indexM < mahasiswas.length; indexM++) {
        const mhs = mahasiswas[indexM];
        await NotifikasiRepository.simpanMahasiswa(
          conn,
          idNotifikasi + "-" + mhs.mahasiswa.toString(),
          keterangan,
          parseInt(mhs.mahasiswa),
          req.user.nomor,
          "DOSEN",
          "/notifikasi/video/" + idNotifikasi + "-" + mhs.mahasiswa.toString(),
          "VIDEO-BARU",
          insert.nomorVideo.toString()
        );
      }
      // notifikasi fcm
      let mahasiswaToken = await MahasiswaRepository.tokenMahasiswaByKuliahId(
        conn,
        parseInt(idK),
        parseInt(jenisSchema)
      );
      for (let index = 0; index < mahasiswaToken.length; index++) {
        const mhs = mahasiswaToken[index];

        if (mhs.fcmToken != "" && mhs.fcmToken != null) {
          await NotifikasiRepository.kirimNotifikasi({
            token: mhs.fcmToken,
            title: "Video Baru",
            body: keterangan,
            action:
              "/mahasiswa/notifikasi/video/" +
              idNotifikasi +
              "-" +
              mhs.mahasiswa.toString(),
            data_terkait: {
              nomorVideo: insert.nomorVideo.toString(),
            },
          });
        }
      }
      // END NOTIFIKASI FCM
      DB.closeConnection(conn);
    }
    // END NOTIFIKASI

    return res.status(insert.sukses ? 201 : 200).json({
      sukses: insert.sukses ? true : false,
      pesan: insert.sukses
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  edit: async (req, res) => {
    const { judul, url, nomor } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await VideoRepository.editData(
      conn,
      judul,
      url,
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
    const result = await VideoRepository.hapusData(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
};
