const DB = require("../config/db/oracle");
const ForumRepository = require("../repository/forum");
const konstanta = require("../helper/konstanta");
const { v4: uuidv4 } = require("uuid");
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
const { mahasiswa, dosen } = require("../helper/user");
module.exports = {
  validasi: (method) => {
    switch (method) {
      case "list":
        return [query("kuliah").notEmpty(), query("jenisSchema").notEmpty()];
      case "buat":
        return [
          body("narasi").notEmpty(),
          body("tipeAkses").notEmpty(),
          body("kuliah").notEmpty(),
          body("jenisSchema").notEmpty(),
        ];
      case "edit":
        return [body("narasi").notEmpty(), body("idForum").notEmpty()];
      case "jawab":
        return [
          body("narasi").notEmpty(),
          body("tipeAkses").notEmpty(),
          body("idForum").notEmpty(),
        ];
      case "hapus":
        return [param("id").notEmpty()];
    }
  },
  index: async (req, res) => {
    const { kuliah, jenisSchema } = { ...req.query };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();
    const result = await ForumRepository.getData(
      conn,
      parseInt(kuliah),
      parseInt(jenisSchema)
    );
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      element.komentar = [];
      element.komentar = await ForumRepository.getKomentar(conn, element.id);
    }
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      element.lampiran = [];
      element.lampiran = await ForumRepository.getLampiran(conn, element.id);
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
    const { narasi, kuliah, jenisSchema, lampiran, tipeAkses } = {
      ...req.body,
    };
    const ip_address_client =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let insert;
    const conn = await DB.getConnection();
    let idForum = uuidv4();

    let convertTipeAkses = null;
    if (tipeAkses == "dosen") {
      convertTipeAkses = "1";
    } else if (tipeAkses == "mahasiswa") {
      convertTipeAkses = "2";
    } else {
      convertTipeAkses = "0";
    }

    insert = await ForumRepository.simpanForum(
      conn,
      idForum,
      narasi.replace("<script>", "<b><i>script tag tidak diizinkan</i></b> "),
      parseInt(kuliah),
      parseInt(jenisSchema),
      parseInt(req.user.nomor),
      convertTipeAkses,
      ip_address_client,
      req.user.nama
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
        "../public/upload/forum/" + year + "/" + month + "/" + day + "/"
      );
      await File.createDir(dir);
      uploadGetPath = await File.createFileBase64(
        "public/upload/forum/" + year + "/" + month + "/" + day + "/",
        "upload/forum/" + year + "/" + month + "/" + day + "/",
        l.file_base_64,
        l.extensi_file,
        l.original_name
      );
      let idLampiran = uuidv4();
      insert = await ForumRepository.simpanLampiran(
        conn,
        idLampiran,
        idForum,
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
  edit: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { narasi, lampiran, idForum } = {
      ...req.body,
    };

    let insert;
    const conn = await DB.getConnection();
    // let idForum = uuidv4();

    let checkForum = await ForumRepository.getForumById(conn, idForum);

    if (parseInt(req.user.nomor) == parseInt(checkForum[0].usernya)) {
      let update = await ForumRepository.updatePostForum(
        conn,
        idForum,
        narasi.replace("<script>", "<b><i>script tag tidak diizinkan</i></b> ")
      );

      let year = waktu.getTglSekarang("YYYY");
      let month = waktu.getTglSekarang("MM");
      let day = waktu.getTglSekarang("DD");

      for (let index = 0; index < lampiran.length; index++) {
        const l = lampiran[index];

        if (l.mode == "DB") {
          let idLampiran = l.id;
          if (l.status == "0") {
            await ForumRepository.hapusLampiran(conn, idLampiran);
          } else if (l.is_edit == true) {
            const dir = path.join(
              __dirname,
              "../public/upload/forum/" + year + "/" + month + "/" + day + "/"
            );
            await File.createDir(dir);
            let uploadGetPath = await File.createFileBase64(
              "public/upload/forum/" + year + "/" + month + "/" + day + "/",
              "upload/forum/" + year + "/" + month + "/" + day + "/",
              l.file_base_64,
              l.extensi_file,
              l.original_name
            );
            await ForumRepository.updateLampiran(
              conn,
              idLampiran,
              uploadGetPath,
              l.extensi_file
            );
          }
        } else if (l.mode == "FORM") {
          let idLampiran = uuidv4();
          const dir = path.join(
            __dirname,
            "../public/upload/forum/" + year + "/" + month + "/" + day + "/"
          );
          await File.createDir(dir);
          let uploadGetPath = await File.createFileBase64(
            "public/upload/forum/" + year + "/" + month + "/" + day + "/",
            "upload/forum/" + year + "/" + month + "/" + day + "/",
            l.file_base_64,
            l.extensi_file,
            l.original_name
          );
          await ForumRepository.simpanLampiran(
            conn,
            idLampiran,
            idForum,
            uploadGetPath,
            l.extensi_file
          );
        }
      }
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: true,
        pesan: "Berhasil disimpan !",
      });
    } else {
      return res.status(200).json({
        sukses: false,
        pesan:
          "Anda tidak mempunyai akses untuk melakukan penyuntingan postingan ini",
      });
    }
  },
  jawab: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const { narasi, tipeAkses, idForum } = {
      ...req.body,
    };
    let idJawaban = uuidv4();

    let convertTipeAkses = null;
    if (tipeAkses == "dosen") {
      convertTipeAkses = "1";
    } else if (tipeAkses == "mahasiswa") {
      convertTipeAkses = "2";
    } else {
      convertTipeAkses = "0";
    }
    const conn = await DB.getConnection();
    let insert = await ForumRepository.simpanJawaban(
      conn,
      idJawaban,
      idForum,
      narasi.replace("<script>", "<b><i>script tag tidak diizinkan</i></b> "),
      parseInt(req.user.nomor),
      convertTipeAkses,
      req.user.nama
    );

    let komentar = await ForumRepository.getKomentar(conn, idForum);

    DB.closeConnection(conn);
    return res.status(insert ? 201 : 200).json({
      success: insert ? true : false,
      pesan: insert
        ? konstanta.DATA_SUKSES_DISIMPAN
        : konstanta.DATA_GAGAL_DISIMPAN,
      komentar: komentar,
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
    let checkForum = await ForumRepository.getForumById(conn, id);

    if (parseInt(req.user.nomor) == parseInt(checkForum[0].usernya) || dosen) {
      const result = await ForumRepository.hapusPostingan(conn, id);
      const lampiran = await ForumRepository.hapusLampiranByIdForum(conn, id);
      const komentar = await ForumRepository.hapusKomentarByIdForum(conn, id);

      DB.closeConnection(conn);
      return res.status(result ? 201 : 200).json({
        sukses: result ? true : false,
        pesan: result
          ? konstanta.DATA_BERHASIL_DIHAPUS
          : konstanta.DATA_GAGAL_DIHAPUS,
      });
    } else {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan:
          "Anda tidak mempunyai akses untuk melakukan penyuntingan postingan ini",
      });
    }
  },
  hapusKomentar: async (req, res) => {
    const { id, forum_id } = { ...req.params };
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(200)
        .json({ sukses: false, pesan: konstanta.PARAMETER_TIDAK_VALID });
    }
    const conn = await DB.getConnection();

    let checkForum = await ForumRepository.getForumById(conn, forum_id);

    if (parseInt(req.user.nomor) == parseInt(checkForum[0].usernya) || dosen) {
      const result = await ForumRepository.hapusKomentar(conn, id);
      let komentar = await ForumRepository.getKomentar(conn, forum_id);

      DB.closeConnection(conn);
      return res.status(result ? 201 : 200).json({
        sukses: result ? true : false,
        pesan: result
          ? "Komentar berhasil dihapus !"
          : konstanta.DATA_GAGAL_DIHAPUS,
        komentar: komentar,
      });
    } else {
      DB.closeConnection(conn);
      return res.status(200).json({
        sukses: false,
        pesan:
          "Anda tidak mempunyai akses untuk melakukan penyuntingan postingan ini",
      });
    }
  },
};
