const waktu = require("../helper/waktu");
let statusSupport = [
  "Nonaktif",
  "Open",
  "Balasan ADMIN / CS",
  "Balasan User",
  "Selesai",
];
module.exports = {
  getData: (conn, userId, tipe) => {
    return conn
      .execute(
        "select s.nomor, s.judul, s.deskripsi, to_char(s.waktu_dibuat, 'yyyy-mm-dd hh24:mi:ss'), to_char(s.waktu_selesai, 'yyyy-mm-dd hh24:mi:ss'), s.status, ip_address from support s " +
          "where s.nomor_user=:0 and s.tipe=:1 and s.status in (1,2,3,4) " +
          "order  by s.waktu_dibuat desc ",
        [userId, tipe]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            deskripsi: item[2],
            waktuDibuat: item[3],
            waktuDibuatIndonesia:
              item[3] == null
                ? "-"
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            waktuSelesai: item[4],
            waktuSelesaiIndonesia:
              item[4] == null
                ? "-"
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            status: item[5],
            ketStatus: item[5] == null ? "-" : statusSupport[parseInt(item[5])],
            ip_address: item[6],
          };
        })
      )
      .catch((err) => {
        console.log("support getData", err);
        return [];
      });
  },
  getDataAdmin: (conn) => {
    let query = `
                select s.nomor, s.judul, s.deskripsi, to_char(s.waktu_dibuat, 'yyyy-mm-dd hh24:mi:ss'), to_char(s.waktu_selesai, 'yyyy-mm-dd hh24:mi:ss'), s.status, ip_address, s.nomor_user, s.tipe,
                case 
                when s.tipe = 'mahasiswa' then 
                  (select m.nama from mahasiswa m
                  where m.nomor = s.nomor_user)
                when s.tipe = 'dosen' then
                  (select p.nama from pegawai p
                  where p.nomor = s.nomor_user)
                when s.tipe = 'kaprodi' then
                  (select p.nama from pegawai p
                  where p.nomor = s.nomor_user)
                when s.tipe = 'baak' then
                  (select p.nama from pegawai p
                  where p.nomor = s.nomor_user)
                when s.tipe = 'admin' then
                  (select p.nama from pegawai p
                  where p.nomor = s.nomor_user)
                end nama_user
                from support s 
                where s.status in (1,2,3,4) 
                order  by s.waktu_dibuat desc 
    `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            deskripsi: item[2],
            waktuDibuat: item[3],
            waktuDibuatIndonesia:
              item[3] == null
                ? "-"
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            waktuSelesai: item[4],
            waktuSelesaiIndonesia:
              item[4] == null
                ? "-"
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            status: item[5],
            ketStatus: item[5] == null ? "-" : statusSupport[parseInt(item[5])],
            ip_address: item[6],
            nomorUser: item[7],
            tipe: item[8],
            namaUser: item[9],
          };
        })
      )
      .catch((err) => {
        console.log("support getDataAdmin", err);
        return [];
      });
  },
  getDataBaak: (conn, nomorBaak) => {
    let query = `
              select s.nomor, s.judul, s.deskripsi, to_char(s.waktu_dibuat, 'yyyy-mm-dd hh24:mi:ss'), to_char(s.waktu_selesai, 'yyyy-mm-dd hh24:mi:ss'), s.status, ip_address, s.nomor_user, s.tipe,
              case 
              when s.tipe = 'mahasiswa' then 
                (select m.nama from mahasiswa m
                where m.nomor = s.nomor_user)
              when s.tipe = 'dosen' then
                (select p.nama from pegawai p
                where p.nomor = s.nomor_user)
              when s.tipe = 'kaprodi' then
                (select p.nama from pegawai p
                where p.nomor = s.nomor_user)
              when s.tipe = 'baak' then
                (select p.nama from pegawai p
                where p.nomor = s.nomor_user)
              when s.tipe = 'admin' then
                (select p.nama from pegawai p
                where p.nomor = s.nomor_user)
              end nama_user
              from support s 
              join support_baak sb on sb.support = s.nomor 
              where sb.nomor_baak=${nomorBaak} and  s.status in (1,2,3,4) 
              order  by s.waktu_dibuat desc
    `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            deskripsi: item[2],
            waktuDibuat: item[3],
            waktuDibuatIndonesia:
              item[3] == null
                ? "-"
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            waktuSelesai: item[4],
            waktuSelesaiIndonesia:
              item[4] == null
                ? "-"
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            status: item[5],
            ketStatus: item[5] == null ? "-" : statusSupport[parseInt(item[5])],
            ip_address: item[6],
            nomorUser: item[7],
            tipe: item[8],
            namaUser: item[9],
          };
        })
      )
      .catch((err) => {
        console.log("support getDataAdmin", err);
        return [];
      });
  },
  getAkunBaak: (conn) => {
    let query = `
      select p.nomor, p.nama from pegawai p 
      where p.staff in (21,48)
      order by p.nama asc
    `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nama: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("support getAkunBaak", err);
        return [];
      });
  },
  getLampiran: (conn, nomor) => {
    return conn
      .execute(
        "select sl.nomor, sl.support, sl.path, sl.extensi_file from support_lampiran sl " +
          "where sl.support=:0 " +
          "order  by sl.nomor asc ",
        [nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            support: item[1],
            path: item[2],
            extensiFile: item[3],
          };
        })
      )
      .catch((err) => {
        console.log("err getLampiran", err);
        return [];
      });
  },
  getDataByNomor: (conn, nomor) => {
    return conn
      .execute(
        "select s.nomor_user, s.tipe, s.status from support s where s.nomor=:1 ",
        [parseInt(nomor)]
      )
      .then((res) => {
        if (res.rows.length != 0) {
          console.log(
            "statusSupport[parseInt(res.rows[0][2])]",
            statusSupport[parseInt(res.rows[0][2])]
          );
          return {
            ditemukan: true,
            nomorUser: res.rows[0][0],
            tipe: res.rows[0][1],
            status: res.rows[0][2],
            ketStatus:
              res.rows[0][2] == null
                ? "-"
                : statusSupport[parseInt(res.rows[0][2])],
          };
        } else {
          return {
            ditemukan: false,
            nomorUser: null,
            tipe: null,
            status: null,
            ketStatus: null,
          };
        }
      })
      .catch((err) => {
        console.log("support getDataByNomor", err);
        return {
          ditemukan: false,
          nomorUser: null,
          tipe: null,
          status: null,
          ketStatus: null,
        };
      });
  },
  getPengirimMahasiswa: (conn, nomor, tipe) => {
    return conn
      .execute("select m.nrp, m.nama from mahasiswa m where m.nomor=:0 ", [
        parseInt(nomor),
      ])
      .then((res) => {
        if (res.rows.length != 0) {
          return {
            ditemukan: true,
            nrp_nip: res.rows[0][0],
            nama: res.rows[0][1],
            tipe: tipe,
          };
        } else {
          return {
            ditemukan: false,
            nrp_nip: null,
            nama: null,
            tipe: tipe,
          };
        }
      })
      .catch((err) => {
        console.log("support getPengirimMahasiswa", err);
        return {
          ditemukan: false,
          nrp_nip: null,
          nama: null,
          tipe: null,
        };
      });
  },
  getPengirimPegawai: (conn, nomor, tipe) => {
    return conn
      .execute("select p.nip, p.nama from pegawai p where p.nomor=:0 ", [
        parseInt(nomor),
      ])
      .then((res) => {
        if (res.rows.length != 0) {
          return {
            ditemukan: true,
            nrp_nip: res.rows[0][0],
            nama: res.rows[0][1],
            tipe: tipe,
          };
        } else {
          return {
            ditemukan: false,
            nrp_nip: null,
            nama: null,
            tipe: tipe,
          };
        }
      })
      .catch((err) => {
        console.log("support getPengirimPegawai", err);
        return {
          ditemukan: false,
          nrp_nip: null,
          nama: null,
          tipe: null,
        };
      });
  },
  getSequenceSupport: (conn) => {
    return conn
      .execute(
        "select last_number from user_sequences where sequence_name='NSUPPORT'"
      )
      .then((res) => res.rows[0][0])
      .catch((err) => {
        console.log("err getSequenceSupport", err);
        return null;
      });
  },
  getSequenceSupportJawaban: (conn) => {
    return conn
      .execute(
        "select last_number from user_sequences where sequence_name='NSUPPORT_JAWABAN'"
      )
      .then((res) => res.rows[0][0])
      .catch((err) => {
        console.log("err getSequenceSupportJawaban", err);
        return null;
      });
  },
  simpanSupport: async (
    conn,
    judul,
    deskripsi,
    nomorUser,
    tipe,
    ipAddressnya
  ) => {
    try {
      let saveSupport = await conn.execute(
        "insert into support (nomor, judul, deskripsi, nomor_user, tipe, status, ip_address, waktu_dibuat) VALUES (nsupport.nextval, :0, :1, :2, :3, :4, :5, TO_DATE(:6, 'YYYY-MM-DD HH24:MI:SS'))",
        [
          judul,
          deskripsi,
          nomorUser,
          tipe,
          "1",
          ipAddressnya,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
        ],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanSupport", error);
      return false;
    }
  },
  simpanSupportJawaban: async (
    conn,
    support,
    deskripsi,
    nomorUser,
    tipe,
    ipAddressnya
  ) => {
    try {
      let saveSupport = await conn.execute(
        "insert into support_jawaban (nomor, support, deskripsi, nomor_user, tipe, ip_address, waktu_balas) VALUES (nsupport_jawaban.nextval, :0, :1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD HH24:MI:SS'))",
        [
          support,
          deskripsi,
          nomorUser,
          tipe,
          ipAddressnya,
          waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"),
        ],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanSupport", error);
      return false;
    }
  },
  simpanSupportLampiran: async (conn, id, path, extensiFile) => {
    try {
      let saveSupport = await conn.execute(
        "insert into support_lampiran (nomor, support, path, extensi_file) VALUES (nsupport_lampiran.nextval, :0, :1, :2)",
        [id, path, extensiFile],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanSupportLampiran", error);
      return false;
    }
  },
  simpanSupportJawabanLampiran: async (conn, id, path, extensiFile) => {
    try {
      let saveSupport = await conn.execute(
        "insert into support_jawaban_lampiran (nomor, support_jawaban, path, extensi_file) VALUES (nsupport_jawaban_lampiran.nextval, :0, :1, :2)",
        [id, path, extensiFile],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanSupportJawabanLampiran", error);
      return false;
    }
  },
  getBalasan: (conn, userId) => {
    let query = `
                  select 
                    sj.nomor, sj.deskripsi, sj.nomor_user, sj.tipe,  to_char(sj.waktu_balas, 'yyyy-mm-dd hh24:mi:ss'), sj.ip_address,
                    case 
                      when sj.tipe = 'mahasiswa' then 
                        (select m.nama from mahasiswa m
                        where m.nomor = sj.nomor_user)
                      when sj.tipe = 'dosen' then
                        (select p.nama from pegawai p
                        where p.nomor = sj.nomor_user)
                      when sj.tipe = 'kaprodi' then
                        (select p.nama from pegawai p
                        where p.nomor = sj.nomor_user)
                      when sj.tipe = 'baak' then
                        (select p.nama from pegawai p
                        where p.nomor = sj.nomor_user)
                      when sj.tipe = 'admin' then
                        (select p.nama from pegawai p
                        where p.nomor = sj.nomor_user)
                    end nama_user
                  from support_jawaban sj 
                  where sj.support = ${userId}
                  order by sj.waktu_balas desc
    `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            deskripsi: item[1],
            nomorUser: item[2],
            nama_user: item[6],
            tipe: item[3],
            waktuDibalas: item[4],
            waktuDibalasIndonesia:
              item[4] == null
                ? "-"
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            ip_address: item[5],
          };
        })
      )
      .catch((err) => {
        console.log("support getData", err);
        return [];
      });
  },
  getBalasanLampiran: (conn, nomor) => {
    return conn
      .execute(
        "select sl.nomor, sl.path, sl.extensi_file from support_jawaban_lampiran sl " +
          "where sl.support_jawaban=:0 " +
          "order  by sl.nomor desc ",
        [nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            path: item[1],
            extensiFile: item[2],
          };
        })
      )
      .catch((err) => {
        console.log("err getBalasanLampiran", err);
        return [];
      });
  },
  updateStatusSupport: (conn, nomor, status) => {
    return conn
      .execute("update support set status=:0 where nomor=:1", [status, nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update updateStatusSupport", err);
        return false;
      });
  },
  updateStatusSupportSelesai: (conn, nomor) => {
    return conn
      .execute(
        "update support set status=:0, waktu_selesai=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
        ["4", waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss"), nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("err updateStatusSupportSelesai", err);
        return false;
      });
  },
  jumlahBaak: (conn, support, baak) => {
    return conn
      .execute(
        "select count(*) from support_baak sb " +
          "where sb.support=:0 and sb.nomor_baak=:1 ",
        [parseInt(support), parseInt(baak)]
      )
      .then((res) => {
        return {
          jumlah: res.rows[0][0],
        };
      })
      .catch((err) => {
        console.log("err jumlahBaak", err);
        return {
          jumlah: 0,
        };
      });
  },
  simpanSupportBaak: async (conn, nomorSupport, baak) => {
    try {
      let saveSupport = await conn.execute(
        "insert into support_baak (nomor, support, nomor_baak, waktu_ditambahkan) VALUES (nsupport_baak.nextval, :0, :1, TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS'))",
        [nomorSupport, baak, waktu.getWaktuSekarang("YYYY-MM-DD HH:mm:ss")],
        {
          autoCommit: true,
        }
      );
      return true;
    } catch (error) {
      console.log("error simpanSupportBaak", error);
      return false;
    }
  },
  getSupportBaak: (conn, nomorSupport) => {
    return conn
      .execute(
        "select sb.nomor, sb.nomor_baak, p.nama, to_char(sb.waktu_ditambahkan, 'yyyy-mm-dd hh24:mi:ss') from support_baak sb " +
          "join pegawai p on p.nomor = sb.nomor_baak " +
          "where sb.support=:0 ",
        [nomorSupport]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nomorBaak: item[1],
            namaBaak: item[2],
            waktuDitambahkan: item[3],
            waktuDitambahkanIndonesia:
              item[3] == null
                ? "-"
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
          };
        })
      )
      .catch((err) => {
        console.log("err getSupportBaak", err);
        return [];
      });
  },
  hapusBaak: (conn, nomor) => {
    return conn
      .execute("delete from support_baak where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete hapusBaak", err);
        return false;
      });
  },
};
