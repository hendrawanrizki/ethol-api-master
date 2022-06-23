const DB = require("../config/db/oracle");
const TugasRepository = require("../repository/tugas");
const MahasiswaRepository = require("../repository/mahasiswa");
const NotifikasiRepository = require("../repository/notifikasi");
const konstanta = require("../helper/konstanta");
const { mahasiswa, dosen } = require("../helper/user");
const { body, param, query, validationResult } = require("express-validator");
const File = require("../helper/file");
const path = require("path");
const waktu = require("../helper/waktu");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list":
        return [query("kuliah").notEmpty(), query("jenisSchema").notEmpty()];
      case "list_by_nomor":
        return [query("nomorTugas").notEmpty()];
      case "tugas_mahasiswa_by_id":
        return [query("id_tugas").notEmpty()];
      case "rekap":
        return [query("kuliah").notEmpty(), query("jenisSchema").notEmpty()];
      case "tambah":
        return [
          body("judul").notEmpty(),
          body("deskripsi").notEmpty(),
          body("tglDeadline").notEmpty(),
          body("idKuliah").notEmpty().isArray(),
        ];
      case "simpan_jawaban":
        return [body("id_tugas").notEmpty()];
      case "update_jawaban":
        return [
          body("id_tugas").notEmpty(),
          body("nomor_tugas_mahasiswa").notEmpty(),
          body("nomor_tugas_file_mahasiswa").notEmpty(),
        ];
      case "edit":
        return [
          body("nomorTugas").notEmpty(),
          body("judul").notEmpty(),
          body("deskripsi").notEmpty(),
          body("tglDeadline").notEmpty(),
          body("idKuliah").notEmpty().isArray(),
        ];
      case "update_catatan_nilai":
        return [body("nomor_tugas_mahasiswa").notEmpty()];
      case "hapus":
        return [param("id").notEmpty()];
      case "pekerjaan_mahasiswa":
        return [query("id_tugas").notEmpty()];
      case "rekap_tugas_admin_baak":
        return [
          query("tahun").notEmpty(),
          query("bulan").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "detail_tugas_admin_baak":
        return [
          query("tahun").notEmpty(),
          query("bulan").notEmpty(),
          query("kuliah").notEmpty(),
          query("jenisSchema").notEmpty(),
        ];
    }
  },
  index: async (req, res) => {
    const { kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let tugas = [];
    let jmlMahasiswa = await TugasRepository.jumlahMahasiswa(
      conn,
      parseInt(kuliah)
    );
    if (dosen(req.user)) {
      tugas = await TugasRepository.getDataDosen(
        conn,
        parseInt(kuliah),
        parseInt(jenisSchema)
      );
    } else if (mahasiswa(req.user)) {
      tugas = await TugasRepository.getDataMahasiswa(
        conn,
        parseInt(kuliah),
        parseInt(req.user.nomor),
        parseInt(jenisSchema)
      );
    }

    for (let index = 0; index < tugas.length; index++) {
      tugas[index].file = await TugasRepository.fileTugasDosen(
        conn,
        parseInt(tugas[index].id)
      );
      tugas[index].jmlMahasiswaMengerjakan =
        await TugasRepository.jmlMahasiswaMengerjakan(
          conn,
          parseInt(tugas[index].id)
        );
      tugas[index].jmlMahasiswa = jmlMahasiswa;
    }

    DB.closeConnection(conn);
    return res.status(200).json(tugas);
  },
  indexSingle: async (req, res) => {
    const { nomorTugas } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let tugas = [];
    let jmlMahasiswa = 0;

    tugas = await TugasRepository.getDataTugasByNomorTugas(
      conn,
      parseInt(nomorTugas)
    );
    if (tugas.length != 0) {
      jmlMahasiswa = await TugasRepository.jumlahMahasiswa(
        conn,
        parseInt(tugas[0].kuliah)
      );
    }
    if (mahasiswa(req.user)) {
      tugas = await TugasRepository.getDataMahasiswaByNomorTugas(
        conn,
        parseInt(req.user.nomor),
        parseInt(nomorTugas)
      );
    }

    for (let index = 0; index < tugas.length; index++) {
      tugas[index].file = await TugasRepository.fileTugasDosen(
        conn,
        parseInt(tugas[index].id)
      );
      tugas[index].jmlMahasiswaMengerjakan =
        await TugasRepository.jmlMahasiswaMengerjakan(
          conn,
          parseInt(tugas[index].id)
        );
      tugas[index].jmlMahasiswa = jmlMahasiswa;
    }

    DB.closeConnection(conn);
    return res.status(200).json(tugas);
  },
  tambah: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { judul, deskripsi, tglDeadline, idKuliah } = {
      ...req.body,
    };
    const file = req.file;
    let insert, savePath, saveFile;
    let resultInsert = [];
    if (file) {
      const conn = await DB.getConnection();
      for (let index = 0; index < idKuliah.length; index++) {
        const dataKuliah = idKuliah[index].split("-");
        const idK = dataKuliah[0];
        const jenisSchema = dataKuliah[1];
        const rename = file.originalname;
        const dir = path.join(__dirname, "../public/upload/task/" + idK + "/");
        savePath = "upload/task/" + idK + "/" + rename;
        await File.createDir(dir);
        saveFile = await File.createFile(dir + rename, file.buffer);

        if (saveFile) {
          insert = await TugasRepository.simpanTugas(
            conn,
            parseInt(idK),
            judul,
            deskripsi,
            tglDeadline,
            savePath,
            parseInt(jenisSchema)
          );
          if (insert.sukses == true) {
            resultInsert.push({
              idKuliah: parseInt(idK),
              idTugas: insert.nomorTugas,
            });
          }
        }
      }
      DB.closeConnection(conn);
    } else {
      const conn = await DB.getConnection();
      for (let index = 0; index < idKuliah.length; index++) {
        const dataKuliah = idKuliah[index].split("-");
        const idK = dataKuliah[0];
        const jenisSchema = dataKuliah[1];
        insert = await TugasRepository.simpanTugas(
          conn,
          parseInt(idK),
          judul,
          deskripsi,
          tglDeadline,
          null,
          parseInt(jenisSchema)
        );
        if (insert.sukses == true) {
          resultInsert.push({
            idKuliah: parseInt(idK),
            idTugas: insert.nomorTugas,
          });
        }
      }
      DB.closeConnection(conn);
    }
    // START NOTIFIKASI
    if (insert.sukses == true) {
      const conn = await DB.getConnection();
      for (let index = 0; index < idKuliah.length; index++) {
        const dataKuliah = idKuliah[index].split("-");
        const idK = dataKuliah[0];
        const jenisSchema = dataKuliah[1];
        const namaMatakuliah = dataKuliah[2];

        let idTugas = null;
        for (let indexri = 0; indexri < resultInsert.length; indexri++) {
          const ri = resultInsert[indexri];
          if (ri.idKuliah == idK) {
            idTugas = ri.idTugas;
          }
        }

        let mahasiswas = await MahasiswaRepository.nomorMahasiswa(
          conn,
          parseInt(idK),
          parseInt(jenisSchema)
        );
        let idNotifikasi = uuidv4();
        for (let indexM = 0; indexM < mahasiswas.length; indexM++) {
          const mhs = mahasiswas[indexM];
          let keterangan =
            "Anda mempunyai tugas baru untuk matakuliah " +
            namaMatakuliah +
            " dengan judul " +
            judul;
          await NotifikasiRepository.simpanMahasiswa(
            conn,
            idNotifikasi + "-" + mhs.mahasiswa.toString(),
            keterangan,
            parseInt(mhs.mahasiswa),
            req.user.nomor,
            "DOSEN",
            "/notifikasi/tugas/" +
              idNotifikasi +
              "-" +
              mhs.mahasiswa.toString(),
            "TUGAS-BARU",
            idTugas.toString()
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
            let keterangan =
              "Anda mempunyai tugas baru untuk matakuliah " +
              namaMatakuliah +
              " dengan judul " +
              judul;
            await NotifikasiRepository.kirimNotifikasi({
              token: mhs.fcmToken,
              title: "Tugas Baru",
              body: keterangan,
              action:
                "/mahasiswa/notifikasi/tugas/" +
                idNotifikasi +
                "-" +
                mhs.mahasiswa.toString(),
              data_terkait: {
                nomorTugas: idTugas.toString(),
              },
            });
          }
        }
        // END NOTIFIKASI FCM
      }
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { nomorTugas, judul, deskripsi, tglDeadline, idKuliah } = {
      ...req.body,
    };
    const file = req.file;
    let update, savePath, saveFile;
    if (file) {
      const conn = await DB.getConnection();
      for (let index = 0; index < idKuliah.length; index++) {
        const idK = idKuliah[index];
        const rename = file.originalname;
        const dir = path.join(__dirname, "../public/upload/task/" + idK + "/");
        savePath = "upload/task/" + idK + "/" + rename;
        await File.createDir(dir);
        saveFile = await File.createFile(dir + rename, file.buffer);

        if (saveFile) {
          update = await TugasRepository.updateTugas(
            conn,
            parseInt(nomorTugas),
            judul,
            deskripsi,
            tglDeadline,
            savePath
          );
          return res.status(update ? 201 : 200).json({
            sukses: true,
            pesan: konstanta.DATA_SUKSES_DISIMPAN,
          });
        } else {
          return res.status(update ? 201 : 200).json({
            sukses: false,
            pesan: konstanta.DATA_GAGAL_DISIMPAN,
          });
        }
      }
    } else {
      const conn = await DB.getConnection();
      update = await TugasRepository.updateTugasNoFile(
        conn,
        parseInt(nomorTugas),
        judul,
        deskripsi,
        tglDeadline
      );
      DB.closeConnection(conn);
      return res.status(update ? 201 : 200).json({
        sukses: update ? true : false,
        pesan: update
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
      });
    }
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
    const result = await TugasRepository.hapusData(conn, parseInt(id));
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
  simpanJawaban: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    let { catatan, id_tugas } = {
      ...req.body,
    };
    if (catatan == "null") {
      catatan = null;
    }
    const file = req.file;
    let insert, savePath, saveFile;
    if (file) {
      let year = waktu.getTglSekarang("YYYY");
      const rename = file.originalname;
      const dir = path.join(
        __dirname,
        "../public/upload/submission/" +
          year +
          "/" +
          id_tugas +
          "/" +
          req.user.nomor +
          "/"
      );
      savePath =
        "upload/submission/" +
        year +
        "/" +
        id_tugas +
        "/" +
        req.user.nomor +
        "/" +
        rename;
      await File.createDir(dir);
      if (File.checkFileExist(dir, rename) == false) {
        saveFile = await File.createFile(dir + rename, file.buffer);
        if (saveFile) {
          const conn = await DB.getConnection();
          insert = await TugasRepository.simpanJawaban(
            conn,
            parseInt(id_tugas),
            parseInt(req.user.nomor),
            catatan,
            waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
            savePath
          );
          DB.closeConnection(conn);
        }
      } else {
        return res.status(200).json({
          sukses: false,
          pesan:
            "File sudah ada, ubah nama file jika anda tetap ingin melakukan upload",
        });
      }
    }
    return res.status(insert && saveFile ? 201 : 200).json({
      sukses: insert && saveFile ? true : false,
      pesan:
        insert && saveFile
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  jawabanTugasById: async (req, res) => {
    const { id_tugas } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let tugas = {};
    tugas = await TugasRepository.jawabanTugasById(
      conn,
      parseInt(id_tugas),
      parseInt(req.user.nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(tugas);
  },
  updateJawaban: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const {
      catatan,
      id_tugas,
      nomor_tugas_mahasiswa,
      nomor_tugas_file_mahasiswa,
    } = {
      ...req.body,
    };
    const file = req.file;
    let update, savePath, saveFile;
    if (file) {
      let year = waktu.getTglSekarang("YYYY");
      const rename = file.originalname;
      const dir = path.join(
        __dirname,
        "../public/upload/submission/" +
          year +
          "/" +
          id_tugas +
          "/" +
          req.user.nomor +
          "/"
      );
      savePath =
        "upload/submission/" +
        year +
        "/" +
        id_tugas +
        "/" +
        req.user.nomor +
        "/" +
        rename;
      await File.createDir(dir);
      saveFile = await File.createFile(dir + rename, file.buffer);
      if (saveFile) {
        const conn = await DB.getConnection();
        update = await TugasRepository.updateJawaban(
          conn,
          catatan,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
          savePath,
          parseInt(nomor_tugas_mahasiswa),
          parseInt(nomor_tugas_file_mahasiswa)
        );
        DB.closeConnection(conn);
        return res.status(update ? 201 : 200).json({
          sukses: true,
          pesan: konstanta.DATA_SUKSES_DISIMPAN,
        });
      } else {
        return res.status(update ? 201 : 200).json({
          sukses: false,
          pesan: konstanta.DATA_GAGAL_DISIMPAN,
        });
      }
    } else {
      const conn = await DB.getConnection();
      update = await TugasRepository.updateJawabanNoFile(
        conn,
        catatan,
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
        parseInt(nomor_tugas_mahasiswa)
      );
      DB.closeConnection(conn);
      return res.status(update ? 201 : 200).json({
        sukses: update ? true : false,
        pesan: update
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
      });
    }
  },
  pekerjaanMahasiswa: async (req, res) => {
    const { id_tugas } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let tugas = {};
    tugas = await TugasRepository.pekerjaanMahasiswa(conn, parseInt(id_tugas));
    DB.closeConnection(conn);
    return res.status(200).json(tugas);
  },
  updateCatatanNilai: async (req, res) => {
    const {
      nomor_tugas_mahasiswa,
      catatanDosen,
      nilai,
      mahasiswa,
      nomorTugas,
      judulTugas,
    } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result;
    if (nilai == null || nilai == "") {
      result = await TugasRepository.updateCatatanNilai(
        conn,
        parseInt(nomor_tugas_mahasiswa),
        catatanDosen,
        null,
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      result = await TugasRepository.updateCatatanNilai(
        conn,
        parseInt(nomor_tugas_mahasiswa),
        catatanDosen,
        parseInt(nilai),
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    }
    DB.closeConnection(conn);

    // START NOTIFIKASI
    if (result == true && (nilai != null || nilai != "")) {
      const conn = await DB.getConnection();
      let idNotifikasi = uuidv4();
      let keterangan =
        "Anda mendapatkan nilai " +
        nilai +
        " dari tugas dengan judul : " +
        judulTugas;
      await NotifikasiRepository.simpanMahasiswa(
        conn,
        idNotifikasi + "-" + mahasiswa.toString(),
        keterangan,
        parseInt(mahasiswa),
        req.user.nomor,
        "DOSEN",
        "/notifikasi/tugas/" + idNotifikasi + "-" + mahasiswa.toString(),
        "TUGAS-DINILAI",
        nomorTugas.toString()
      );
      // notifikasi fcm
      let mahasiswaToken = await MahasiswaRepository.tokenMahasiswaByNomor(
        conn,
        parseInt(mahasiswa)
      );
      for (let index = 0; index < mahasiswaToken.length; index++) {
        const mhs = mahasiswaToken[index];

        if (mhs.fcmToken != "" && mhs.fcmToken != null) {
          await NotifikasiRepository.kirimNotifikasi({
            token: mhs.fcmToken,
            title: "Tugas Dinilai",
            body: keterangan,
            action:
              "/mahasiswa/notifikasi/tugas/" +
              idNotifikasi +
              "-" +
              mahasiswa.toString(),
            data_terkait: {
              nomorTugas: nomorTugas.toString(),
            },
          });
        }
      }
      // END NOTIFIKASI FCM
    }
    DB.closeConnection(conn);
    // END NOTIFIKASI

    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? "Berhasil menyimpan data !"
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  daftarTugasTerakhirMahasiswa: async (req, res) => {
    const { kuliahs } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await TugasRepository.tugasTerakhirMahasiswa(
      conn,
      parseInt(req.user.nomor),
      kuliahs
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  rekapTugasKuliah: async (req, res) => {
    const { kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await TugasRepository.rekapTugasKuliah(
      conn,
      parseInt(kuliah),
      parseInt(jenisSchema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  rekapTugasKuliahAdminBaak: async (req, res) => {
    const { tahun, bulan, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await TugasRepository.rekapAdminBaak(
      conn,
      parseInt(tahun),
      parseInt(bulan),
      parseInt(jurusan),
      parseInt(program)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  detailTugasKuliahAdminBaak: async (req, res) => {
    const { tahun, bulan, kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await TugasRepository.detailAdminBaak(
      conn,
      parseInt(tahun),
      parseInt(bulan),
      parseInt(kuliah),
      parseInt(jenisSchema)
    );
    console.log("result", result);
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
};
