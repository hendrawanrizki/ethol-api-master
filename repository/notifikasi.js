const FCM = require("fcm-node");
const waktu = require("../helper/waktu");
const serverKey =
  "AAAAylpBWHY:APA91bGSEzDz9pUhw-5oaFn_K4vT7LJafKOmUOetx7AjFsG1xntyFnayyNO-2yP0-i4DsFdiCN2ue6OmrHnnuDWzhvafSBBmKrttA5HlTzS5vgd_T51PkXZ53Wtykr64CdzjkUvePsJm";
module.exports = {
  kirimNotifikasi: (dataNotifikasi) => {
    var fcm = new FCM(serverKey);

    var message = {
      to: dataNotifikasi.token,
      notification: {
        title: dataNotifikasi.title,
        body: dataNotifikasi.body,
        click_action: dataNotifikasi.action,
        priority: "high",
      },
      priority: "high",
      data: dataNotifikasi.data_terkait,
      android: {
        notification: {
          clickAction: dataNotifikasi.action,
        },
      },
    };
    fcm.send(message, function (err, response) {
      if (err) {
        // console.log("Fcm Error !", err);
      } else {
        // console.log("Successfully sent with response: ", response);
      }
    });
  },
  simpanMahasiswa: (
    conn,
    idNotifikasi,
    keterangan,
    mahasiswa,
    pengirim,
    rolePengirim,
    urlWeb,
    kodeNotifikasi,
    dataTerkait
  ) => {
    if (pengirim == "") {
      pengirim = "[SYSTEM]";
      rolePengirim = "[SYSTEM]";
    }
    return conn
      .execute(
        "insert into notifikasi_mahasiswa (id_notifikasi, keterangan, mahasiswa, pengirim, role_pengirim, status, url_web, kodenotifikasi, data_terkait, created_at) values (:0, :1, :2, :3, :4, :5, :6, :7, :8, to_date(:9, 'YYYY-MM-DD HH24:MI:SS'))",
        [
          idNotifikasi,
          keterangan,
          mahasiswa,
          pengirim,
          rolePengirim,
          "1",
          urlWeb,
          kodeNotifikasi,
          dataTerkait,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
        ],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("insert notifikasi simpanMahasiswa", err);
        return false;
      });
  },
  ambilNotifikasiMahasiswa: (conn, mahasiswa, filter) => {
    let query = `select * from notifikasi_mahasiswa nm 
    where nm.mahasiswa = ${mahasiswa} `;
    if (filter != "SEMUA") {
      query += ` and nm.kodenotifikasi like '%${filter}%' `;
    }
    query += ` order by created_at desc `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            idNotifikasi: item[0],
            keterangan: item[1],
            status: item[5],
            urlWeb: item[6],
            kodeNotifikasi: item[7],
            dataTerkait: item[8],
            createdAt: item[9],
            waktuNotifikasi: waktu.diffWaktu(item[9]),
            createdAtIndonesia: waktu.formatWaktu(
              item[9],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilNotifikasiMahasiswa : ", err);
        return [];
      });
  },
  jumlahNotifikasiMahasiswa: (conn, mahasiswa) => {
    return conn
      .execute(
        "select count(*) jml from notifikasi_mahasiswa nm  " +
          "where nm.mahasiswa=:0 and nm.status='1' ",
        [mahasiswa]
      )
      .then((res) => {
        return {
          jumlah: res.rows[0][0],
        };
      })
      .catch((err) => {
        console.log("err jumlahNotifikasiMahasiswa", err);
        return {
          jumlah: 0,
        };
      });
  },
  bacaNotifMahasiswa: (conn, idNotifikasi) => {
    return conn
      .execute(
        "update notifikasi_mahasiswa set status='2', updated_at=to_date(:0, 'YYYY-MM-DD HH24:MI:SS') where id_notifikasi=:1 ",
        [waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"), idNotifikasi],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err bacaNotifMahasiswa", err);
        return false;
      });
  },
  getNotifikasiMhsSingle: async (conn, idNotifikasi) => {
    return conn
      .execute(
        "select * from notifikasi_mahasiswa nm where nm.id_notifikasi=:0",
        [idNotifikasi]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id_notifikasi: item[0],
            keterangan: item[1],
            mahasiswa: item[2],
            pengirim: item[3],
            role_pengirim: item[4],
            status: item[5],
            url_web: item[6],
            kodenotifikasi: item[7],
            data_terkait: item[8],
            waktuNotifikasi: waktu.diffWaktu(item[9]),
            created_at:
              item[9] == null
                ? null
                : waktu.formatWaktu(
                    item[9],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            updated_at:
              item[10] == null
                ? null
                : waktu.formatWaktu(
                    item[10],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
          };
        })
      )
      .catch((err) => {
        console.log("err getNotifikasiSingle : ", err);
        return [];
      });
  },
  simpanDosen: (
    conn,
    idNotifikasi,
    keterangan,
    dosen,
    pengirim,
    rolePengirim,
    urlWeb,
    kodeNotifikasi,
    dataTerkait
  ) => {
    if (pengirim == "") {
      pengirim = "[SYSTEM]";
      rolePengirim = "[SYSTEM]";
    }
    return conn
      .execute(
        "insert into notifikasi_dosen (id_notifikasi, keterangan, dosen, pengirim, role_pengirim, status, url_web, kodenotifikasi, data_terkait, created_at) values (:0, :1, :2, :3, :4, :5, :6, :7, :8, to_date(:9, 'YYYY-MM-DD HH24:MI:SS'))",
        [
          idNotifikasi,
          keterangan,
          dosen,
          pengirim,
          rolePengirim,
          "1",
          urlWeb,
          kodeNotifikasi,
          dataTerkait,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
        ],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("insert notifikasi simpanDosen", err);
        return false;
      });
  },
  ambilNotifikasiDosen: (conn, dosen, filter) => {
    let query = `select * from notifikasi_dosen nd 
    where nd.dosen = ${dosen} `;
    if (filter != "SEMUA") {
      query += ` and nd.kodenotifikasi like '%${filter}%' `;
    }
    query += ` order by created_at desc `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            idNotifikasi: item[0],
            keterangan: item[1],
            status: item[5],
            urlWeb: item[6],
            kodeNotifikasi: item[7],
            dataTerkait: item[8],
            createdAt: item[9],
            waktuNotifikasi: waktu.diffWaktu(item[9]),
            createdAtIndonesia: waktu.formatWaktu(
              item[9],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilNotifikasiDosen : ", err);
        return [];
      });
  },
  jumlahNotifikasiDosen: (conn, dosen) => {
    return conn
      .execute(
        "select count(*) jml from notifikasi_dosen nd  " +
          "where nd.dosen=:0 and nd.status='1' ",
        [dosen]
      )
      .then((res) => {
        return {
          jumlah: res.rows[0][0],
        };
      })
      .catch((err) => {
        console.log("err jumlahNotifikasiDosen", err);
        return {
          jumlah: 0,
        };
      });
  },
  bacaNotifDosen: (conn, idNotifikasi) => {
    return conn
      .execute(
        "update notifikasi_dosen set status='2', updated_at=to_date(:0, 'YYYY-MM-DD HH24:MI:SS') where id_notifikasi=:1 ",
        [waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"), idNotifikasi],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err bacaNotifDosen", err);
        return false;
      });
  },
  getNotifikasiDsnSingle: async (conn, idNotifikasi) => {
    return conn
      .execute("select * from notifikasi_dosen nd where nd.id_notifikasi=:0", [
        idNotifikasi,
      ])
      .then((res) =>
        res.rows.map((item) => {
          return {
            id_notifikasi: item[0],
            keterangan: item[1],
            dosen: item[2],
            pengirim: item[3],
            role_pengirim: item[4],
            status: item[5],
            url_web: item[6],
            kodenotifikasi: item[7],
            data_terkait: item[8],
            waktuNotifikasi: waktu.diffWaktu(item[9]),
            created_at:
              item[9] == null
                ? null
                : waktu.formatWaktu(
                    item[9],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            updated_at:
              item[10] == null
                ? null
                : waktu.formatWaktu(
                    item[10],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
          };
        })
      )
      .catch((err) => {
        console.log("err getNotifikasiDsnSingle : ", err);
        return [];
      });
  },
};
