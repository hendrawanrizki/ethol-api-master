const DB = require("../config/db/oracle");
const PresensiRepository = require("../repository/presensi");
const MahasiswaRepository = require("../repository/mahasiswa");
const NotifikasiRepository = require("../repository/notifikasi");
const konstanta = require("../helper/konstanta");
const { body, param, query, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { mahasiswa, dosen } = require("../helper/user");
const {
  getWaktuSekarang,
  selisihMenit,
  formatWaktu,
} = require("../helper/waktu");
module.exports = {
  validasi: (method) => {
    switch (method) {
      case "rekap_presensi_admin_baak":
        return [
          query("tahun").notEmpty(),
          query("bulan").notEmpty(),
          query("program").notEmpty(),
          query("jurusan").notEmpty(),
        ];
      case "rekap_presensi_dosen":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("dosen").notEmpty(),
        ];
      case "tanggal_presensi_dosen_per_bulan":
        return [
          query("tahun").notEmpty(),
          query("bulan").notEmpty(),
          query("dosen").notEmpty(),
          query("kuliah").notEmpty(),
        ];
      case "tanggal_presensi_dosen_per_semester":
        return [
          query("tahun").notEmpty(),
          query("semester").notEmpty(),
          query("dosen").notEmpty(),
          query("kuliah").notEmpty(),
        ];
      case "jumlah_mahasiswa_per_kuliah":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
      case "daftar_mahasiswa_hadir_kuliah":
        return [query("key").notEmpty()];
      case "daftar_mahasiswa_tidak_hadir_kuliah":
        return [
          query("kuliah").notEmpty(),
          query("jenis_schema").notEmpty(),
          query("key").notEmpty(),
        ];
      case "history_presensi":
        return [
          query("kuliah").notEmpty(),
          query("jenis_schema").notEmpty(),
          query("nomor").notEmpty(),
        ];
      case "aktifKuliah":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
      case "terakhirKuliah":
        return [query("kuliah").notEmpty(), query("jenis_schema").notEmpty()];
      case "aktifDosen":
        return [query("dosen").notEmpty()];
      case "buka":
        return [
          body("kuliah").notEmpty(),
          body("jenis_schema").notEmpty(),
          body("dosen").notEmpty(),
          body("key").notEmpty(),
        ];
      case "mahasiswa":
        return [
          body("kuliah").notEmpty(),
          body("jenis_schema").notEmpty(),
          body("mahasiswa").notEmpty(),
          body("key").notEmpty(),
        ];
      case "tutup":
        return [body("nomor").notEmpty()];
      case "batalkan":
        return [
          body("kuliah").notEmpty(),
          body("jenis_schema").notEmpty(),
          body("key").notEmpty(),
        ];
    }
  },
  rekapPresensi: async (req, res) => {
    const { tahun, bulan, program, jurusan } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.rekapAdminBaak(
      conn,
      parseInt(tahun),
      parseInt(bulan),
      parseInt(jurusan),
      parseInt(program)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  rekapPresensiDosen: async (req, res) => {
    const { tahun, semester, dosen } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.rekapDosen(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(dosen)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tanggalPresensiDosenPerBulan: async (req, res) => {
    const { tahun, bulan, dosen, kuliah } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.tanggalPresensiDosenPerBulan(
      conn,
      parseInt(tahun),
      parseInt(bulan),
      parseInt(dosen),
      parseInt(kuliah)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tanggalPresensiDosenPerSemester: async (req, res) => {
    const { tahun, semester, dosen, kuliah } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.tanggalPresensiDosenPerSemester(
      conn,
      parseInt(tahun),
      parseInt(semester),
      parseInt(kuliah),
      parseInt(dosen)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  jumlahMahasiswaPerKuliah: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.jumlahMahasiswaPerKuliah(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  daftarMahasiswaHadirKuliah: async (req, res) => {
    const { key } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.daftarMahasiswaHadirKuliah(
      conn,
      key
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  daftarMahasiswaTidakHadirKuliah: async (req, res) => {
    const { kuliah, jenis_schema, key } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.daftarMahasiswaTidakHadirKuliah(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  historyPresensi: async (req, res) => {
    const { kuliah, jenis_schema, nomor } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    let result = [];
    if (dosen(req.user)) {
      result = await PresensiRepository.historyPresensiDosen(
        conn,
        parseInt(kuliah),
        parseInt(jenis_schema),
        parseInt(nomor)
      );
    } else if (mahasiswa(req.user)) {
      result = await PresensiRepository.historyPresensiMahasiswa(
        conn,
        parseInt(kuliah),
        parseInt(jenis_schema),
        parseInt(nomor)
      );
    }
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  aktifKuliah: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.cekPresesiAktifKuliah(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  terakhirKuliah: async (req, res) => {
    const { kuliah, jenis_schema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json([]);
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.cekPresensiKuliahTerakhir(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema)
    );
    DB.closeConnection(conn);
    return res.status(200).json(
      result
        ? {
            ditemukan: true,
            ...result,
            tanggal_format: formatWaktu(
              result.tanggal,
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm:ss"
            ),
          }
        : { ditemukan: false }
    );
  },
  aktifDosen: async (req, res) => {
    const { dosen } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(200).json({ aktif: true });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.cekPresensiAktifDosen(
      conn,
      parseInt(dosen)
    );
    DB.closeConnection(conn);
    return res.status(200).json({ aktif: result });
  },
  buka: async (req, res) => {
    const { kuliah, jenis_schema, dosen, key, namaMk } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: "Parameter tidak valid" });
    }
    const waktuSekarang = getWaktuSekarang("YYYY-MM-DD HH:mm:ss");
    const conn = await DB.getConnection();
    const presensiAktif = await PresensiRepository.cekPresensiAktifDosen(
      conn,
      parseInt(dosen)
    );
    if (presensiAktif) {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan:
          "Presensi Anda sebelumnya masih terbuka, harap tutup terlebih dahulu untuk membuka presensi selanjutnya ",
      });
    }
    const presensiTerakhir = await PresensiRepository.cekPresensiTerakhir(
      conn,
      parseInt(dosen)
    );
    if (
      presensiTerakhir.kuliah === parseInt(kuliah) &&
      presensiTerakhir.jenis_schema === parseInt(jenis_schema)
    ) {
      const selisihWaktu = selisihMenit(
        waktuSekarang,
        presensiTerakhir.tanggal
      );
      if (selisihWaktu < 150) {
        DB.closeConnection(conn);
        return res.status(200).json({
          sukses: false,
          pesan:
            "Anda akan dobel di kuliah yang sama, harap menunggu 150 menit dihitung dari presensi anda sebelumnya",
        });
      }
    }
    const result = await PresensiRepository.simpanDosen(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      parseInt(dosen),
      key,
      waktuSekarang
    );
    DB.closeConnection(conn);

    if (result == true) {
      // START NOTIFIKASI
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
        "Dosen telah melakukan presensi untuk matakuliah " + namaMatakuliah;
      for (let indexM = 0; indexM < mahasiswas.length; indexM++) {
        const mhs = mahasiswas[indexM];
        await NotifikasiRepository.simpanMahasiswa(
          conn,
          idNotifikasi + "-" + mhs.mahasiswa.toString(),
          keterangan,
          parseInt(mhs.mahasiswa),
          parseInt(dosen),
          "DOSEN",
          "/notifikasi/presensi/" +
            idNotifikasi +
            "-" +
            mhs.mahasiswa.toString(),
          "PRESENSI-KULIAH",
          idK + "-" + jenisSchema
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
            title: "Presensi Kuliah",
            body: keterangan,
            action:
              "/mahasiswa/notifikasi/presensi/" +
              idNotifikasi +
              "-" +
              mhs.mahasiswa.toString(),
            data_terkait: {
              nomorKuliah: idK + "-" + jenisSchema,
            },
          });
        }
      }
      // END NOTIFIKASI FCM
      DB.closeConnection(conn);
    }
    // END NOTIFIKASI
    return res.status(200).json({
      sukses: result,
      pesan: result ? "Presensi berhasil dibuka" : "Presensi gagal dibuka",
    });
  },
  mahasiswa: async (req, res) => {
    const { kuliah, jenis_schema, mahasiswa, key, kuliah_asal } = {
      ...req.body,
    };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: "Parameter tidak valid" });
    }
    const waktuSekarang = getWaktuSekarang("YYYY-MM-DD HH:mm:ss");
    const conn = await DB.getConnection();
    const presensiAktif = await PresensiRepository.cekPresensiMasihTerbuka(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key
    );
    if (!presensiAktif) {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan: "Presensi sudah ditutup",
      });
    }
    const sudahPresensi = await PresensiRepository.cekSudahPresensi(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key,
      parseInt(mahasiswa)
    );
    if (sudahPresensi) {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan: "Anda sudah melakukan di sesi kuliah ini",
      });
    }

    const result = await PresensiRepository.simpanMahasiswa(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      parseInt(mahasiswa),
      key,
      waktuSekarang,
      parseInt(kuliah_asal)
    );
    DB.closeConnection(conn);
    return res.status(200).json({
      sukses: result,
      pesan: result ? "Presensi berhasil disimpan" : "Presensi gagal disimpan",
    });
  },
  mahasiswaModeAdmin: async (req, res) => {
    const { kuliah, jenis_schema, mahasiswa, key, kuliah_asal, waktuPresensi } =
      {
        ...req.body,
      };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: "Parameter tidak valid" });
    }
    const conn = await DB.getConnection();
    const sudahPresensi = await PresensiRepository.cekSudahPresensi(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key,
      parseInt(mahasiswa)
    );
    if (sudahPresensi) {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan: "Anda sudah melakukan di sesi kuliah ini",
      });
    }

    const result = await PresensiRepository.simpanMahasiswa(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      parseInt(mahasiswa),
      key,
      waktuPresensi,
      parseInt(kuliah_asal)
    );
    DB.closeConnection(conn);
    return res.status(200).json({
      sukses: result,
      pesan: result ? "Presensi berhasil disimpan" : "Presensi gagal disimpan",
    });
  },
  tutup: async (req, res) => {
    const { nomor } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: "Parameter tidak valid" });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.tutup(conn, parseInt(nomor));
    DB.closeConnection(conn);
    return res.status(200).json({
      sukses: result,
      pesan: result ? "Presensi berhasil ditutup" : "Presensi gagal ditutup",
    });
  },
  batalkan: async (req, res) => {
    const { kuliah, jenis_schema, key } = { ...req.body };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: "Parameter tidak valid" });
    }
    const conn = await DB.getConnection();
    const result = await PresensiRepository.hapusDosen(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key
    );
    await PresensiRepository.hapusMahasiswa(
      conn,
      parseInt(kuliah),
      parseInt(jenis_schema),
      key
    );
    DB.closeConnection(conn);
    return res.status(200).json({
      sukses: result,
      pesan: result
        ? "Presensi berhasil dibatalkan"
        : "Presensi gagal dibatalkan",
    });
  },
};
