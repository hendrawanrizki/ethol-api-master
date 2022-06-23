const DB = require("../config/db/oracle");
const MateriRepository = require("../repository/materi");
const MahasiswaRepository = require("../repository/mahasiswa");
const NotifikasiRepository = require("../repository/notifikasi");
const KuliahRepository = require("../repository/kuliah");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");
const File = require("../helper/file");
const path = require("path");
const waktu = require("../helper/waktu");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list_materi":
        return [query("dosen").notEmpty(), query("matakuliah").notEmpty()];
      case "list_by_nomor":
        return [query("nomorMateri").notEmpty()];
      case "hapus_materi":
        return [param("id").notEmpty()];
      case "tambah":
        return [
          body("judul").notEmpty(),
          body("idKuliah").notEmpty().isArray(),
          body("nomorDosen").notEmpty().isNumeric(),
        ];
      case "matkul_sejenis":
        return [query("dosen").notEmpty(), query("matakuliah").notEmpty()];
      case "tambah_matkul_sejenis":
        return [
          body("judul").notEmpty(),
          body("idMatakuliah").notEmpty(),
          body("nomorDosen").notEmpty(),
          body("pathFile").notEmpty(),
        ];
      case "materi_by_program_jurusan":
        return [query("program").notEmpty(), query("jurusan").notEmpty()];
    }
  },
  index: async (req, res) => {
    const { dosen, matakuliah } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MateriRepository.ambilSemua(conn, dosen, matakuliah);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexSingle: async (req, res) => {
    const { nomorMateri } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MateriRepository.ambilByNomor(
      conn,
      parseInt(nomorMateri)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  indexSingleHashed: async (req, res) => {
    const { nomorMateri } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MateriRepository.findByIdComplete(
      conn,
      parseInt(nomorMateri)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambah: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { judul, idKuliah, nomorDosen, tahun, semester } = { ...req.body };
    const file = req.file;
    let insert, savePath, saveFile;
    if (file) {
      const rename = file.originalname;
      const dir = path.join(
        __dirname,
        "../public/upload/material/" + nomorDosen + "/"
      );
      savePath = "upload/material/" + nomorDosen + "/" + rename;
      await File.createDir(dir);
      saveFile = await File.createFile(dir + rename, file.buffer);
    }
    const conn = await DB.getConnection();
    if (file && saveFile) {
      for (let index = 0; index < idKuliah.length; index++) {
        const idK = idKuliah[index];
        insert = await MateriRepository.simpan(
          conn,
          parseInt(idK),
          judul,
          parseInt(nomorDosen),
          savePath
        );
      }
    }
    DB.closeConnection(conn);

    // START NOTIFIKASI
    if ((insert.sukses && saveFile) == true) {
      const conn = await DB.getConnection();
      for (let index = 0; index < idKuliah.length; index++) {
        const idMk = idKuliah[index];
        let getMatakuliah = await KuliahRepository.matakuliahByNomor(
          conn,
          parseInt(idMk)
        );
        let namaMatakuliah = "";
        if (getMatakuliah.length != 0) {
          namaMatakuliah = getMatakuliah[0].namaMk;
        }
        let mahasiswas = await MahasiswaRepository.nomorMahasiswaByMatkul(
          conn,
          parseInt(idMk),
          parseInt(nomorDosen),
          parseInt(tahun),
          parseInt(semester)
        );
        let idNotifikasi = uuidv4();
        for (let indexM = 0; indexM < mahasiswas.length; indexM++) {
          const mhs = mahasiswas[indexM];
          let keterangan =
            "Materi baru dengan judul " +
            judul +
            " telah ditambahkan oleh Dosen untuk matakuliah " +
            namaMatakuliah;
          await NotifikasiRepository.simpanMahasiswa(
            conn,
            idNotifikasi + "-" + mhs.mahasiswa.toString(),
            keterangan,
            parseInt(mhs.mahasiswa),
            req.user.nomor,
            "DOSEN",
            "/notifikasi/materi/" +
              idNotifikasi +
              "-" +
              mhs.mahasiswa.toString(),
            "MATERI-BARU",
            insert.nomorMateri.toString()
          );
        }
        // notifikasi fcm
        let mahasiswaToken =
          await MahasiswaRepository.tokenMahasiswaByMatakuliahId(
            conn,
            parseInt(idMk),
            parseInt(nomorDosen),
            parseInt(tahun),
            parseInt(semester)
          );
        for (let index = 0; index < mahasiswaToken.length; index++) {
          const mhs = mahasiswaToken[index];

          if (mhs.fcmToken != "" && mhs.fcmToken != null) {
            let keterangan =
              "Materi baru dengan judul " +
              judul +
              " telah ditambahkan oleh Dosen untuk matakuliah " +
              namaMatakuliah;
            await NotifikasiRepository.kirimNotifikasi({
              token: mhs.fcmToken,
              title: "Materi Baru",
              body: keterangan,
              action:
                "/mahasiswa/notifikasi/materi/" +
                idNotifikasi +
                "-" +
                mhs.mahasiswa.toString(),
              data_terkait: {
                nomorMateri: insert.nomorMateri.toString(),
              },
            });
          }
        }
        // END NOTIFIKASI FCM
      }
      DB.closeConnection(conn);
    }
    // END NOTIFIKASI
    return res.status(insert.sukses && saveFile ? 201 : 200).json({
      sukses: insert.sukses && saveFile ? true : false,
      pesan:
        insert.sukses && saveFile
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  hapus: async (req, res) => {
    const { id } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const materi = await MateriRepository.findById(conn, parseInt(id));
    if (!materi) {
      res.status(409);
      res.json({
        message: "Materi dengan id" + id + " tidak ditemukan",
      });
      return;
    }
    result = await MateriRepository.hapusData(conn, id);
    if (!result) {
      res.status(409);
      res.json({
        sukses: false,
        message: "Materi gagal dihapus",
      });
      return;
    }
    res.status(200);
    res.json({
      sukses: true,
      pesan: "Materi berhasil dihapus",
    });
    DB.closeConnection(conn);
    return;
  },
  matkulSejenis: async (req, res) => {
    const { dosen, matakuliah } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MateriRepository.findRelated(
      conn,
      parseInt(matakuliah),
      parseInt(dosen)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tambahMatkulSejenis: async (req, res) => {
    const { judul, idMatakuliah, nomorDosen, pathFile, tahun, semester } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const insert = await MateriRepository.simpan(
      conn,
      parseInt(idMatakuliah),
      judul,
      parseInt(nomorDosen),
      pathFile
    );
    DB.closeConnection(conn);

    // START NOTIFIKASI
    if (insert.sukses == true) {
      const conn = await DB.getConnection();
      const idMk = parseInt(idMatakuliah);
      let getMatakuliah = await KuliahRepository.matakuliahByNomor(
        conn,
        parseInt(idMk)
      );
      let namaMatakuliah = "";
      if (getMatakuliah.length != 0) {
        namaMatakuliah = getMatakuliah[0].namaMk;
      }
      let mahasiswas = await MahasiswaRepository.nomorMahasiswaByMatkul(
        conn,
        parseInt(idMk),
        parseInt(nomorDosen),
        parseInt(tahun),
        parseInt(semester)
      );
      let idNotifikasi = uuidv4();
      for (let indexM = 0; indexM < mahasiswas.length; indexM++) {
        const mhs = mahasiswas[indexM];
        let keterangan =
          "Materi baru dengan judul " +
          judul +
          " telah ditambahkan oleh Dosen untuk matakuliah " +
          namaMatakuliah;
        await NotifikasiRepository.simpanMahasiswa(
          conn,
          idNotifikasi + "-" + mhs.mahasiswa.toString(),
          keterangan,
          parseInt(mhs.mahasiswa),
          req.user.nomor,
          "DOSEN",
          "/notifikasi/materi/" + idNotifikasi + "-" + mhs.mahasiswa.toString(),
          "MATERI-BARU",
          insert.nomorMateri.toString()
        );
      }
      // notifikasi fcm
      let mahasiswaToken =
        await MahasiswaRepository.tokenMahasiswaByMatakuliahId(
          conn,
          parseInt(idMk),
          parseInt(nomorDosen),
          parseInt(tahun),
          parseInt(semester)
        );
      for (let index = 0; index < mahasiswaToken.length; index++) {
        const mhs = mahasiswaToken[index];

        if (mhs.fcmToken != "" && mhs.fcmToken != null) {
          let keterangan =
            "Materi baru dengan judul " +
            judul +
            " telah ditambahkan oleh Dosen untuk matakuliah " +
            namaMatakuliah;
          await NotifikasiRepository.kirimNotifikasi({
            token: mhs.fcmToken,
            title: "Materi Baru",
            body: keterangan,
            action:
              "/mahasiswa/notifikasi/materi/" +
              idNotifikasi +
              "-" +
              mhs.mahasiswa.toString(),
            data_terkait: {
              nomorMateri: insert.nomorMateri.toString(),
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
  materiProgramJurusan: async (req, res) => {
    const { program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await MateriRepository.materiProgramJurusan(
      conn,
      parseInt(program),
      parseInt(jurusan)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
