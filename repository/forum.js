const waktu = require("../helper/waktu");
let ketStatus = ["Nonaktif", "Aktif"];
module.exports = {
  getData: (conn, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select * from forum f where f.kuliah =:0 and f.jenis_schema=:1 and f.status='1' order by f.waktu desc ",
        [kuliah, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            narasi: item[1],
            kuliah: item[2],
            jenis_schema: item[3],
            waktu: item[4],
            waktu_indonesia:
              item[4] == null
                ? "-"
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            status: item[5],
            ketStatus: item[5] == null ? "-" : ketStatus[parseInt(item[5])],
            ip_address: item[6],
            user: item[7],
            tipe_user: item[8],
            nama_user: item[9],
          };
        })
      )
      .catch((err) => {
        console.log("support getData", err);
        return [];
      });
  },
  getKomentar: (conn, forumId) => {
    return conn
      .execute(
        "select * from forum_jawaban fj where fj.forum_id=:0 and fj.status='1' order by fj.waktu desc ",
        [forumId]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            forum_id: item[1],
            narasi: item[2],
            waktu: item[3],
            waktu_indonesia:
              item[3] == null
                ? "-"
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            status: item[4],
            ketStatus: item[4] == null ? "-" : ketStatus[parseInt(item[4])],
            user: item[5],
            tipe_user: item[6],
            nama_user: item[7],
          };
        })
      )
      .catch((err) => {
        console.log("support getKomentar", err);
        return [];
      });
  },
  getLampiran: (conn, forumId) => {
    return conn
      .execute("select * from forum_lampiran fl where fl.forum_id=:0", [
        forumId,
      ])
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            forum_id: item[1],
            pathFile:
              item[2] == "" || item[2] == null
                ? ""
                : process.env.BASE_URL + "/" + item[2],
            extensiFile: item[3],
          };
        })
      )
      .catch((err) => {
        console.log("support getLampiran", err);
        return [];
      });
  },
  getForumById: (conn, forumId) => {
    return conn
      .execute(
        "select f.id, f.usernya, f.kuliah, f.jenis_schema, f.tipe_user, f.nama_user from forum f where f.id=:0 and rownum>=1",
        [forumId]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            usernya: item[1],
            tipeUser: item[4],
            namaUser: item[5],
          };
        })
      )
      .catch((err) => {
        console.log("support getForumById", err);
        return {
          berhasil: false,
          jml: 0,
        };
      });
  },
  simpanForum: async (
    conn,
    idForum,
    narasi,
    kuliah,
    jenisSchema,
    nomor,
    tipeAkses,
    ipAddressnya,
    namaUser
  ) => {
    try {
      let saveForum = await conn.execute(
        "insert into forum (id, narasi, kuliah, jenis_schema, waktu, status, ip_address, usernya, tipe_user, nama_user) VALUES (:0, :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD HH24:MI:SS'), :5, :6, :7, :8, :9)",
        [
          idForum,
          narasi,
          kuliah,
          jenisSchema,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
          "1",
          ipAddressnya,
          nomor,
          tipeAkses,
          namaUser,
        ],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error saveForum", error);
      return false;
    }
  },
  simpanLampiran: async (conn, id, forum_id, path, extensiFile) => {
    try {
      let saveLampiran = await conn.execute(
        "insert into forum_lampiran (id, forum_id, path_file, extensi_file) VALUES (:0, :1, :2, :3)",
        [id, forum_id, path, extensiFile],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanLampiranForum", error);
      return false;
    }
  },
  simpanJawaban: async (
    conn,
    id,
    idForum,
    narasi,
    nomor,
    tipeAkses,
    namaUser
  ) => {
    try {
      let saveForum = await conn.execute(
        "insert into forum_jawaban (id, forum_id, narasi, waktu, status, usernya, tipe_user, nama_user) VALUES (:0, :1, :2, TO_DATE(:3, 'YYYY-MM-DD HH24:MI:SS'), :4, :5, :6, :7)",
        [
          id,
          idForum,
          narasi,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
          "1",
          nomor,
          tipeAkses,
          namaUser,
        ],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanJawaban", error);
      return false;
    }
  },
  updatePostForum: async (conn, idForum, narasi) => {
    return await conn
      .execute(
        "update forum set narasi=:0, waktu=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where id=:2",
        [narasi, waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"), idForum],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update updatePostForum", err);
        return false;
      });
  },
  updateLampiran: async (conn, id, path, extensiFile) => {
    try {
      let updateLampiran = await conn.execute(
        "update forum_lampiran set path_file=:0, extensi_file=:1 where id=:2",
        [path, extensiFile, id],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error updateLampiran", error);
      return false;
    }
  },
  hapusLampiran: (conn, nomor) => {
    return conn
      .execute("delete from forum_lampiran where id=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("hapusLampiran", err);
        return false;
      });
  },
  hapusPostingan: (conn, nomor) => {
    return conn
      .execute("delete from forum where id=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err hapusPostingan", err);
        return false;
      });
  },
  hapusKomentar: (conn, nomor) => {
    return conn
      .execute("delete from forum_jawaban where id=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err hapusKomentar", err);
        return false;
      });
  },
  hapusLampiranByIdForum: (conn, nomor) => {
    return conn
      .execute("delete from forum_lampiran where forum_id=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err hapusLampiranByIdForum", err);
        return false;
      });
  },
  hapusKomentarByIdForum: (conn, nomor) => {
    return conn
      .execute("delete from forum_jawaban where forum_id=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err hapusKomentarByIdForum", err);
        return false;
      });
  },
};
