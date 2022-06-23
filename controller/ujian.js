const DB = require("../config/db/oracle");
const UjianRepository = require("../repository/ujian");
const JadwalRepository = require("../repository/jadwal");
const KuliahRepository = require("../repository/kuliah");
const HariRepository = require("../repository/hari");
const konstanta = require("../helper/konstanta");
const { mahasiswa, dosen, baak, admin } = require("../helper/user");
const { body, param, query, validationResult } = require("express-validator");
const waktu = require("../helper/waktu");
const moment = require("moment");
moment.locale("id");
const File = require("../helper/file");
const path = require("path");
const rp = require("request-promise");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list_admin":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
          query("jenis").notEmpty(),
        ];
      case "edit_jadwal":
        return [
          body("tanggalMulai").notEmpty(),
          body("tanggalSelesai").notEmpty(),
          body("nomorRuang").notEmpty(),
          body("nomorUjian").notEmpty(),
        ];
      case "tambah_jadwal":
        return [
          body("tanggalMulai").notEmpty(),
          body("tanggalSelesai").notEmpty(),
          body("nomorRuang").notEmpty(),
          body("nomorKuliah").notEmpty(),
          body("jenisSchema").notEmpty(),
          body("dosen").notEmpty(),
        ];
      case "edit_jadwal_dosen":
        return [
          body("tanggalSelesai").notEmpty(),
          body("nomorUjian").notEmpty(),
        ];
      case "edit_tanggal":
        return [
          body("tanggalMulai").notEmpty(),
          body("tanggalSelesai").notEmpty(),
          body("nomorUjian").notEmpty(),
        ];
      case "edit_dosen":
        return [body("nomorDosen").notEmpty(), body("nomorUjian").notEmpty()];
      case "generate_jadwal":
        return [
          body("tahun").notEmpty(),
          body("semester").notEmpty(),
          body("jenis").notEmpty(),
        ];
      case "tarik_soal":
        return [
          body("tahun").notEmpty(),
          body("semester").notEmpty(),
          body("jenis").notEmpty(),
          body("nomorUjian").notEmpty(),
          body("kuliah").notEmpty(),
          body("jenisSchema").notEmpty(),
        ];
      case "submit":
        return [body("ujian").notEmpty(), body("mahasiswa").notEmpty()];
      case "daftar_ujian":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("jenis").notEmpty(),
        ];

      case "daftar_ujian_single":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("jenis").notEmpty(),
          query("nomorUjian").notEmpty(),
        ];
      case "hasil_ujian":
        return [query("nomor").notEmpty()];
      case "cek_soal":
        return [body("nomor").notEmpty()];
      case "jawaban":
        return [query("nomor").notEmpty()];
      case "detail_ujian":
        return [
          query("jenis").notEmpty(),
          query("kuliah").notEmpty(),
          query("jenisSchema").notEmpty(),
        ];
      case "update_catatan_nilai":
        return [body("nomor_ujian_mahasiswa").notEmpty()];
      case "cari_kuliah":
        return [query("tahun").notEmpty(), query("semester").notEmpty()];
    }
  },
  generateJadwal: async (req, res) => {
    const { tahun, semester, jenis, rentang_tanggal_ujian } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    // const result = await HariRepository.ambilSemua(conn);
    const result = await JadwalRepository.getJadwal(
      conn,
      parseInt(tahun),
      parseInt(semester)
    );

    if (result.length != 0) {
      const hari = await HariRepository.ambilSemua(conn);
      let hariUjian = [];
      for (let index = 0; index < rentang_tanggal_ujian.length; index++) {
        const element = rentang_tanggal_ujian[index];
        let hariInput = waktu.formatTgl(element, "YYYY-MM-DD", "dddd");
        for (let index_h = 0; index_h < hari.length; index_h++) {
          const el_hari = hari[index_h];
          if (el_hari.hari == hariInput) {
            hariUjian.push({
              nomor: el_hari.nomor,
              hari: el_hari.hari,
              tanggal: element,
            });
          }
          if (hariInput == "Jumat" && el_hari.hari == "Jum'at") {
            hariUjian.push({
              nomor: el_hari.nomor,
              hari: el_hari.hari,
              tanggal: element,
            });
          }
        }
      }
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        let menit = parseInt(element.jam_kali_50) * 50;
        // hari 1
        let tempConvertJamAwal_1 = "";
        let convertJamAkhir_1 = "";
        let jam_1 = element.jam_1;
        let hari_1 = element.hari_1;
        if (hari_1 != "" && hari_1 != null && jam_1 != "" && jam_1 != null) {
          if (hari_1.toString().length == 1) {
            if (jenis == 1) {
              // jika uts generate seperti jadwalnya
              let tglUjian = "";
              for (let index = 0; index < hariUjian.length; index++) {
                const hu = hariUjian[index];
                if (hu.nomor == element.hari_1) {
                  tglUjian = hu.tanggal;
                }
              }
              let substrJamAwal1 = jam_1.substring(0, 5);
              tempConvertJamAwal_1 = moment(substrJamAwal1, "HH:mm");
              convertJamAkhir_1 = moment(tempConvertJamAwal_1)
                .add(menit, "minutes")
                .format("HH:mm");
              element.mulai = tglUjian + " " + substrJamAwal1 + ":00";
              element.selesai = tglUjian + " " + convertJamAkhir_1 + ":00";
              element.convertRuang = element.ruang_1;
            } else {
              element.mulai = null;
              element.convertRuang = element.ruang_1;
              element.selesai = null;
            }
            await UjianRepository.saveJadwal(conn, element, index, jenis);
          }
        }
      }
      DB.closeConnection(conn);
      let narasi = "";
      if (jenis == 1) {
        narasi = "UTS";
      } else if (jenis == 2) {
        narasi = "UAS";
      }
      return res.status(200).json({
        sukses: true,
        pesan: "Data jadwal ujian " + narasi + " berhasil di generate",
      });
    } else {
      DB.closeConnection(conn);
      return res.json({
        sukses: false,
        pesan: "Data tidak tersedia",
      });
    }
  },
  hapusJadwal: async (req, res) => {
    const { tahun, semester, jenis } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await UjianRepository.bersihkanJadwal(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(jenis)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIHAPUS
        : konstanta.DATA_GAGAL_DIHAPUS,
    });
  },
  tarikSoalUjian: async (req, res) => {
    const { tahun, semester, nomorUjian, kuliah, jenisSchema, jenis } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const soalFileExt = await UjianRepository.getFileExtensionSoalMIS(
      conn,
      parseInt(kuliah),
      parseInt(jenisSchema),
      parseInt(jenis)
    );
    const soalBlob = await UjianRepository.getBlobSoalMIS(
      conn,
      parseInt(kuliah),
      parseInt(jenisSchema),
      parseInt(jenis)
    );
    if (soalFileExt && soalBlob) {
      var optionsRP = {
        method: "POST",
        uri: process.env.BASE_BLOB_SERVICE_LOCAL + "/generate_soal.php",
        body: {
          year: tahun,
          course: kuliah,
          jenis,
          jenisSchema,
          ext: soalFileExt,
          blob: soalBlob,
        },
        json: true,
        proxy: false,
      };

      const upload = await rp(optionsRP)
        .then((parsedBody) => parsedBody)
        .catch(function (err) {
          console.log("tarik-soal service-local", err);
          return null;
        });
      // console.log("upload", upload);
      if (upload) {
        const updatePathSoal = await UjianRepository.updatePathSoal(
          conn,
          upload.url,
          parseInt(nomorUjian)
        );
        if (updatePathSoal) {
          DB.closeConnection(conn);
          return res.json({
            success: updatePathSoal,
            url: process.env.BASE_BLOB_SERVICE_URL + upload.url,
            message: "Soal berhasil diambil dari MIS",
          });
        } else {
          return res.json({
            success: false,
            message: "Soal gagal disimpan ke DB",
          });
        }
      } else {
        return res.json({
          success: false,
          message: "Soal gagal disimpan ke server",
        });
      }
    } else {
      DB.closeConnection(conn);
      return res.json({
        success: false,
        message: "Soal belum terverifikasi di MIS",
      });
    }
  },
  index: async (req, res) => {
    const { tahun, semester, program, jurusan, jenis } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await UjianRepository.getDataUjianAdmin(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(program),
      parseInt(jurusan),
      parseInt(jenis)
    );
    if (ujian.length != 0) {
      // await result.forEach(async (element) => {
      for (let index = 0; index < ujian.length; index++) {
        element = ujian[index];
        element.dataKuliahGabungan = [];
        if (element.isKuliahGabungan == true) {
          let kelasnya = await KuliahRepository.getKelasKuliahGabunganSimple(
            conn,
            element.kuliahGabungan,
            element.jenis_schema
          );
          element.dataKuliahGabungan = kelasnya;
          if (kelasnya.length) {
            let kelasGabungString = "";
            for (let idxSub = 0; idxSub < kelasnya.length; idxSub++) {
              const kls = kelasnya[idxSub];
              if (kelasnya.length == idxSub + 1) {
                kelasGabungString += kls.kelas + " " + kls.pararel;
              } else {
                kelasGabungString += kls.kelas + " " + kls.pararel + ", ";
              }
            }
            element.kelasnya = kelasGabungString;
          }
        } else {
          element.kelasnya = element.kelas + " " + element.pararel;
          element.dataKuliahGabungan = [];
        }
      }
    }
    DB.closeConnection(conn);
    return res.status(200).json(ujian);
  },
  submit: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    let { ujian, mahasiswa } = {
      ...req.body,
    };
    const conn = await DB.getConnection();
    let jadwal = await UjianRepository.getTableUjianByNomor(
      conn,
      parseInt(ujian)
    );
    DB.closeConnection(conn);

    // kode untuk membatasi waktu pengumpulan ujian
    // const isTime =
    //   new Date() > new Date(jadwal.mulai) &&
    //   new Date() < new Date(jadwal.selesai);
    // if (!isTime) {
    //   return res.status(200).json({
    //     sukses: false,
    //     pesan:
    //       "Anda melebihi batas waktu ujian, harap hubungi dosen yang bersangkutan !",
    //   });
    // }
    // end kode untuk membatasi waktu pengumpulan ujian

    const file = req.file;
    let simpan, savePath, saveFile;
    if (file) {
      let year = waktu.getTglSekarang("YYYY");
      const rename =
        mahasiswa +
        "." +
        req.file.originalname.split(".")[
          req.file.originalname.split(".").length - 1
        ];
      const dir = path.join(
        __dirname,
        "../public/upload/ujian/" + year + "/" + ujian + "/"
      );
      savePath = "upload/ujian/" + year + "/" + ujian + "/" + rename;
      await File.createDir(dir);
      saveFile = await File.createFile(dir + rename, file.buffer);
      if (saveFile) {
        const conn = await DB.getConnection();
        const nomorExist = await UjianRepository.cekJawaban(
          conn,
          ujian,
          mahasiswa
        );
        if (nomorExist) {
          simpan = await UjianRepository.updateJawaban(
            conn,
            waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
            savePath,
            nomorExist
          );
        } else {
          simpan = await UjianRepository.simpanJawaban(
            conn,
            parseInt(ujian),
            parseInt(mahasiswa),
            waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
            savePath
          );
        }
        DB.closeConnection(conn);
      } else {
        return res.status(200).json({
          sukses: false,
          pesan: "Gagal mengupload File !",
        });
      }
    }
    return res.status(simpan && saveFile ? 201 : 200).json({
      sukses: simpan && saveFile ? true : false,
      pesan:
        simpan && saveFile
          ? konstanta.DATA_SUKSES_DISIMPAN
          : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  tambahJadwal: async (req, res) => {
    const {
      tanggalMulai,
      tanggalSelesai,
      nomorRuang,
      nomorKuliah,
      jenisSchema,
      dosen,
    } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let dataUjian = {
      nomor_k: parseInt(nomorKuliah),
      jenis_schema: parseInt(jenisSchema),
      dosen: parseInt(dosen),
      mulai: tanggalMulai,
      selesai: tanggalSelesai,
      convertRuang: parseInt(nomorRuang),
    };
    const result = await UjianRepository.saveJadwal(conn, dataUjian, 0, 2);
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  editJadwal: async (req, res) => {
    const { tanggalMulai, tanggalSelesai, nomorRuang, nomorUjian } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await UjianRepository.editJadwalUjian(
      conn,
      tanggalMulai,
      tanggalSelesai,
      parseInt(nomorRuang),
      parseInt(nomorUjian)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIUBAH
        : konstanta.DATA_GAGAL_DIUBAH,
    });
  },
  editJadwalDosen: async (req, res) => {
    const { tanggalSelesai, nomorUjian } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await UjianRepository.editJadwalUjianDosen(
      conn,
      tanggalSelesai,
      parseInt(nomorUjian)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIUBAH
        : konstanta.DATA_GAGAL_DIUBAH,
    });
  },
  editTanggal: async (req, res) => {
    const { tanggalMulai, tanggalSelesai, nomorUjian } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await UjianRepository.editTanggalUjian(
      conn,
      tanggalMulai,
      tanggalSelesai,
      parseInt(nomorUjian)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIUBAH
        : konstanta.DATA_GAGAL_DIUBAH,
    });
  },
  editDosen: async (req, res) => {
    const { nomorDosen, nomorUjian } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors", errors);
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await UjianRepository.editDosen(
      conn,
      parseInt(nomorDosen),
      parseInt(nomorUjian)
    );
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? konstanta.DATA_BERHASIL_DIUBAH
        : konstanta.DATA_GAGAL_DIUBAH,
    });
  },
  daftarUjian: async (req, res) => {
    const { tahun, semester, jenis } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }

    let result;
    if (dosen(req.user)) {
      const conn = await DB.getConnection();
      result = await UjianRepository.getDataUjianDosen(
        conn,
        parseInt(tahun),
        parseInt(semester),
        parseInt(req.user.nomor),
        parseInt(jenis)
      );
      if (result.length != 0) {
        // await result.forEach(async (element) => {
        for (let index = 0; index < result.length; index++) {
          element = result[index];
          element.dataKuliahGabungan = [];
          if (element.isKuliahGabungan == true) {
            element.dataKuliahGabungan =
              await KuliahRepository.getKelasKuliahGabungan(
                conn,
                element.kuliahGabungan,
                element.jenis_schema
              );
          } else {
            element.dataKuliahGabungan = [];
          }
        }
      }
      DB.closeConnection(conn);
    } else if (mahasiswa(req.user)) {
      const conn = await DB.getConnection();
      result = await UjianRepository.getDataUjianmahasiswa(
        conn,
        parseInt(tahun),
        parseInt(semester),
        parseInt(req.user.nomor),
        parseInt(jenis)
      );
      DB.closeConnection(conn);
    }
    return res.status(200).json(result);
  },
  detailUjian: async (req, res) => {
    const { jenis, kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await UjianRepository.getDetailUjian(
      conn,
      parseInt(jenis),
      parseInt(kuliah),
      parseInt(jenisSchema)
    );
    DB.closeConnection(conn);

    return res.status(200).json(result);
  },
  getDaftarUjianDosenWithNomorUjian: async (req, res) => {
    const { tahun, semester, jenis, nomorUjian } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = await UjianRepository.getDataUjianDosenWithNomorUjian(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(req.user.nomor),
      parseInt(jenis),
      parseInt(nomorUjian)
    );
    DB.closeConnection(conn);

    return res.status(200).json(result);
  },

  hasilUjian: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await UjianRepository.getHasilUjianByNomorUjian(
      conn,
      parseInt(nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(ujian);
  },
  cekSoal: async (req, res) => {
    const { nomor } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await UjianRepository.getTableUjianByNomor(
      conn,
      parseInt(nomor)
    );

    const mulaiUjian = moment(ujian.mulai);
    const waktuSekarang = moment();
    const selesaiUjian = moment(ujian.selesai);
    const cekSelisihMulai = waktuSekarang.diff(mulaiUjian, "seconds");
    const cekSelesaiUjian = waktuSekarang.diff(selesaiUjian, "seconds");
    let urlSoal = null;
    // console.log("ujian", ujian);
    // console.log("ujian.url_soal", ujian.url_soal);
    if (dosen(req.user)) {
      if (ujian.url_soal != null && ujian.url_soal != "") {
        urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
      }
    }
    let soal = {
      running: false,
      isDone: false,
      urlSoal: urlSoal,
    };
    if (cekSelisihMulai >= 0) {
      // jika waktu ujian telah mulai
      if (cekSelesaiUjian <= 0) {
        // jika waktu ujian masih berjalan
        if (ujian.url_soal != null && ujian.url_soal != "") {
          urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
        }
        soal = {
          running: true,
          isDone: false,
          urlSoal: urlSoal,
        };
      } else {
        if (ujian.url_soal != null && ujian.url_soal != "") {
          urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
        }
        soal = {
          running: false,
          isDone: true,
          urlSoal: urlSoal,
        };
      }
    }
    // console.log("soal", soal);
    DB.closeConnection(conn);
    return res.status(200).json(soal);
  },
  cekSoalAgama: async (req, res) => {
    const { nomor } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await UjianRepository.getTableUjianAgamaByNomor(
      conn,
      parseInt(nomor)
    );

    const mulaiUjian = moment(ujian.mulai);
    const waktuSekarang = moment();
    const selesaiUjian = moment(ujian.selesai);
    const cekSelisihMulai = waktuSekarang.diff(mulaiUjian, "seconds");
    const cekSelesaiUjian = waktuSekarang.diff(selesaiUjian, "seconds");
    let urlSoal = null;
    // console.log("ujian", ujian);
    // console.log("ujian.url_soal", ujian.url_soal);
    if (dosen(req.user)) {
      if (ujian.url_soal != null && ujian.url_soal != "") {
        urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
      }
    }
    let soal = {
      running: false,
      isDone: false,
      urlSoal: urlSoal,
    };
    if (cekSelisihMulai >= 0) {
      // jika waktu ujian telah mulai
      if (cekSelesaiUjian <= 0) {
        // jika waktu ujian masih berjalan
        if (ujian.url_soal != null && ujian.url_soal != "") {
          urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
        }
        soal = {
          running: true,
          isDone: false,
          urlSoal: urlSoal,
        };
      } else {
        if (ujian.url_soal != null && ujian.url_soal != "") {
          urlSoal = process.env.BASE_BLOB_SERVICE_URL + ujian.url_soal;
        }
        soal = {
          running: false,
          isDone: true,
          urlSoal: urlSoal,
        };
      }
    }
    // console.log("soal", soal);
    DB.closeConnection(conn);
    return res.status(200).json(soal);
  },
  jawaban: async (req, res) => {
    const { nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await UjianRepository.getJawabanMahasiswa(
      conn,
      parseInt(nomor),
      parseInt(req.user.nomor)
    );
    DB.closeConnection(conn);
    return res.status(200).json(ujian);
  },
  updateCatatanNilai: async (req, res) => {
    const { nomor_ujian_mahasiswa, catatanDosen, nilai } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    let result;
    if (nilai == null || nilai == "") {
      result = await UjianRepository.updateCatatanNilai(
        conn,
        parseInt(nomor_ujian_mahasiswa),
        catatanDosen,
        null,
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    } else {
      result = await UjianRepository.updateCatatanNilai(
        conn,
        parseInt(nomor_ujian_mahasiswa),
        catatanDosen,
        parseInt(nilai),
        waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")
      );
    }
    DB.closeConnection(conn);
    return res.status(result ? 201 : 200).json({
      sukses: result ? true : false,
      pesan: result
        ? "Berhasil menyimpan data !"
        : konstanta.DATA_GAGAL_DISIMPAN,
    });
  },
  cariKuliah: async (req, res) => {
    const { tahun, semester } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let ujian = await JadwalRepository.getCariKuliah(
      conn,
      parseInt(tahun),
      parseInt(semester)
    );
    DB.closeConnection(conn);
    return res.status(200).json(ujian);
  },
};
