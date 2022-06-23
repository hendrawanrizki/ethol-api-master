const ujian = require("../controller/ujian");
const waktu = require("../helper/waktu");
module.exports = {
  getTableUjianByNomor: (conn, nomor) => {
    return conn
      .execute(
        "select u.nomor, to_char(u.mulai, 'yyyy-mm-dd hh24:mi:ss'), to_char(u.selesai, 'yyyy-mm-dd hh24:mi:ss'), u.url_soal from ujian u " +
          "where u.nomor=:0 ",
        [nomor]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          mulai: res.rows[0][1],
          selesai: res.rows[0][2],
          url_soal: res.rows[0][3],
        };
      })
      .catch((err) => {
        console.log(err);
        return {
          nomor: null,
          mulai: null,
          selesai: null,
          url_soal: null,
        };
      });
  },
  getTableUjianAgamaByNomor: (conn, nomor) => {
    return conn
      .execute(
        "select u.nomor, to_char(u.mulai, 'yyyy-mm-dd hh24:mi:ss'), to_char(u.selesai, 'yyyy-mm-dd hh24:mi:ss'), u.url_soal from ujian_agama u " +
          "where u.nomor=:0 ",
        [nomor]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          mulai: res.rows[0][1],
          selesai: res.rows[0][2],
          url_soal: res.rows[0][3],
        };
      })
      .catch((err) => {
        console.log(err);
        return {
          nomor: null,
          mulai: null,
          selesai: null,
          url_soal: null,
        };
      });
  },

  getDetailUjian: (conn, jenis, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select  ju.nomor as ju_nomor, to_char(ju.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ju.selesai, 'YYYY-MM-DD HH24:MI:SS'), p.nama, p.gelar_dpn, p.gelar_blk, rm.nama, sc.url, j.total, ms.total " +
          "from ujian ju " +
          "left join pegawai p on ju.dosen=p.nomor " +
          "left join room_meeting rm on ju.room_meeting_id=rm.nomor " +
          "left join server_conference sc on rm.server=sc.nomor " +
          "left join (select ujian, count(nomor) as total from ujian_mhs group by ujian) j on j.ujian=ju.nomor " +
          "left join (select kuliah, count(mahasiswa) as total, jenis_schema from mahasiswa_semester group by kuliah, jenis_schema) ms on ms.kuliah=ju.kuliah " +
          "where ju.jenis=:0 and ju.kuliah=:1 and ju.jenis_schema=:2 and ju.mulai is not null and ms.jenis_schema=ju.jenis_schema",
        [jenis, kuliah, jenisSchema]
      )
      .then((res) => {
        if (res.rows.length) {
          return {
            nomor: res.rows[0][0],
            mulai: res.rows[0][1],
            mulai_indonesia:
              res.rows[0][1] == null
                ? null
                : waktu.formatWaktu(
                    res.rows[0][1],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            selesai: res.rows[0][2],
            selesai_indonesia:
              res.rows[0][2] == null
                ? null
                : waktu.formatWaktu(
                    res.rows[0][2],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            dosen: res.rows[0][3],
            gelar_dpn: res.rows[0][4],
            gelar_blk: res.rows[0][5],
            room: res.rows[0][6],
            server: res.rows[0][7],
            total_jawaban: res.rows[0][8] || 0,
            total_mahasiswa: res.rows[0][9],
          };
        }
        return [];
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataUjianAdmin: (conn, tahun, semester, program, jurusan, jenis) => {
    return conn
      .execute(
        "select k.nomor, k.jenis_schema, p.nama, mk.matakuliah, k.kode_kelas, ju.nomor as nomor_ju, to_char(ju.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ju.selesai, 'YYYY-MM-DD HH24:MI:SS'), ju.room_meeting_id, rm.nama, ju.url_soal, p.gelar_dpn, p.gelar_blk, p.nomor, k.pararel, k.kuliah_gabungan  " +
          "from kuliah k " +
          "left join matakuliah mk on mk.nomor=k.matakuliah " +
          "left join ujian ju on ju.kuliah=k.nomor " +
          "left join pegawai p on p.nomor=ju.dosen " +
          "left join room_meeting rm on ju.room_meeting_id=rm.nomor " +
          "where k.tahun=:0 and k.semester=:1 and mk.program=:2 and mk.jurusan=:3 and k.dosen is not null and k.jenis_schema=mk.jenis_schema and k.jenis_schema=ju.jenis_schema and ju.jenis=:4 " +
          "order by k.nomor",
        [tahun, semester, program, jurusan, jenis]
      )
      .then((res) =>
        res.rows.map((item) => {
          let isKuliahGabung = false;
          if (item[1] == 1 || item[1]==4) {
            // jika kelas reguler ada kuliah gabungan
            if (item[15] != null && item[15] != "") {
              // jika kuliah gabung tidak null dan tidak kosong
              isKuliahGabung = true;
            }
          }
          return {
            nomor: item[0],
            jenis_schema: item[1],
            nomor_dosen: item[13],
            nama_dosen: item[2],
            matakuliah: item[3],
            kelas: item[4],
            ujian: item[5]
              ? {
                  nomor: item[5],
                  mulai: item[6],
                  mulai_indonesia:
                    item[6] == null
                      ? null
                      : waktu.formatWaktu(
                          item[6],
                          "YYYY-MM-DD HH:mm:ss",
                          "dddd, DD MMMM YYYY - HH:mm"
                        ),
                  selesai: item[7],
                  selesai_indonesia:
                    item[7] == null
                      ? null
                      : waktu.formatWaktu(
                          item[7],
                          "YYYY-MM-DD HH:mm:ss",
                          "dddd, DD MMMM YYYY - HH:mm"
                        ),
                  room_meeting_id: item[8],
                  room_name: item[9],
                }
              : null,
            soal: item[10]
              ? process.env.BASE_BLOB_SERVICE_URL + item[10]
              : null,
            gelar_dpn: item[11],
            gelar_blk: item[12],
            pararel: item[14],
            isKuliahGabungan: isKuliahGabung,
            kuliahGabungan: isKuliahGabung == true ? item[15] : null,
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataUjianDosen: (conn, tahun, semester, nomor, jenis) => {
    return conn
      .execute(
        "select k.nomor as k_nomor, k.jenis_schema, k.kode_kelas, k.pararel, mk.nomor as mk_nomor, mk.matakuliah, p.nomor as p_nomor, p.nama, ju.nomor as ju_nomor, to_char(ju.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ju.selesai, 'YYYY-MM-DD HH24:MI:SS'), rm.nomor, rm.nama, sc.nomor, sc.nama, sc.url, p.gelar_dpn, p.gelar_blk, k.kuliah_gabungan " +
          "from kuliah k " +
          "left join ujian ju on k.nomor=ju.kuliah " +
          "left join matakuliah mk on k.matakuliah=mk.nomor " +
          "left join pegawai p on ju.dosen=p.nomor " +
          "left join room_meeting rm on ju.room_meeting_id=rm.nomor " +
          "left join server_conference sc on rm.server=sc.nomor " +
          "where ju.jenis=:0 and k.tahun=:1 and k.semester=:2 and mk.jenis_schema=k.jenis_schema and ju.dosen=:3 and k.dosen is not null and ju.mulai is not null " +
          "order by ju.mulai",
        [jenis, tahun, semester, nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          let isKuliahGabung = false;
          if (item[1] == 1 || item[1]==4) {
            // jika kelas reguler ada kuliah gabungan
            if (item[18] != null && item[18] != "") {
              // jika kuliah gabung tidak null dan tidak kosong
              isKuliahGabung = true;
            }
          }
          return {
            nomor: item[0],
            jenis_ujian: jenis,
            jenis_schema: item[1],
            kode_kelas: item[2],
            pararel: item[3],
            matakuliah: {
              nomor: item[4],
              nama: item[5],
            },
            dosen: {
              nomor: item[6],
              nama: item[7],
              gelar_dpn: item[16],
              gelar_blk: item[17],
            },
            ujian: {
              nomor: item[8],
              mulai: item[9],
              mulai_indonesia:
                item[9] == null
                  ? null
                  : waktu.formatWaktu(
                      item[9],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
              selesai: item[10],
              selesai_indonesia:
                item[10] == null
                  ? null
                  : waktu.formatWaktu(
                      item[10],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
            },
            ruang: {
              nomor: item[11],
              nama: item[12],
            },
            server: {
              nomor: item[13],
              nama: item[14],
              url: item[15],
            },
            isKuliahGabungan: isKuliahGabung,
            kuliahGabungan: isKuliahGabung == true ? item[18] : null,
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataUjianmahasiswa: (conn, tahun, semester, nomor, jenis) => {
    return conn
      .execute(
        "select k.nomor as k_nomor, k.jenis_schema, k.kode_kelas, k.pararel, mk.nomor as mk_nomor, mk.matakuliah, p.nomor as p_nomor, p.nama, ju.nomor as ju_nomor, to_char(ju.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ju.selesai, 'YYYY-MM-DD HH24:MI:SS'), rm.nomor, rm.nama, sc.nomor, sc.nama, sc.url, p.gelar_dpn, p.gelar_blk, 0 kuliah_agama, ms.kuliah_asal " +
          "from kuliah k " +
          "left join ujian ju on k.nomor=ju.kuliah " +
          "left join matakuliah mk on k.matakuliah=mk.nomor " +
          "left join pegawai p on ju.dosen=p.nomor " +
          "left join mahasiswa_semester ms on ms.kuliah=k.nomor " +
          "left join room_meeting rm on ju.room_meeting_id=rm.nomor " +
          "left join server_conference sc on rm.server=sc.nomor " +
          "where ju.jenis=:0 and k.tahun=:1 and k.semester=:2 and mk.jenis_schema=k.jenis_schema and ms.mahasiswa=:3 and k.dosen is not null and ju.mulai is not null " +
          "union all " +
          "select ka.nomor, ka.jenis_schema, '' kode_kelas, '' pararel, a.nomor, a.agama, p.nomor, p.nama, ua.nomor, to_char(ua.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ua.selesai, 'YYYY-MM-DD HH24:MI:SS'), null, '', null, '', '', p.gelar_dpn, p.gelar_blk, 1, null kuliah_asal " +
          "from kuliah_agama ka " +
          "join agama a on a.nomor = ka.agama " +
          "join pegawai p on p.nomor = ka.dosen " +
          "join ujian_agama ua on ua.kuliah_agama = ka.nomor and ua.jenis_schema = ka.jenis_schema " +
          "join kuliah_agama_mahasiswa kam on kam.kuliah_agama = ka.nomor " +
          "where ka.tahun=:4 and ka.semester=:5 and kam.mahasiswa=:6 and ua.jenis=:7 ",
        [jenis, tahun, semester, nomor, tahun, semester, nomor, jenis]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jenis_schema: item[1],
            jenis_ujian: jenis,
            kode_kelas: item[2],
            pararel: item[3],
            kuliah_agama: item[18],
            kuliah_asal: item[19],
            matakuliah: {
              nomor: item[4],
              nama: item[5],
            },
            dosen: {
              nomor: item[6],
              nama: item[7],
              gelar_dpn: item[16],
              gelar_blk: item[17],
            },
            ujian: {
              nomor: item[8],
              mulai: item[9],
              mulai_indonesia:
                item[9] == null
                  ? null
                  : waktu.formatWaktu(
                      item[9],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
              selesai: item[10],
              selesai_indonesia:
                item[10] == null
                  ? null
                  : waktu.formatWaktu(
                      item[10],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
            },
            ruang: {
              nomor: item[11],
              nama: item[12],
            },
            server: {
              nomor: item[13],
              nama: item[14],
              url: item[15],
            },
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataUjianDosenWithNomorUjian: (
    conn,
    tahun,
    semester,
    nomor,
    jenis,
    nomorUjian
  ) => {
    return conn
      .execute(
        "select k.nomor as k_nomor, k.jenis_schema, k.kode_kelas, k.pararel, mk.nomor as mk_nomor, mk.matakuliah, p.nomor as p_nomor, p.nama, ju.nomor as ju_nomor, to_char(ju.mulai, 'YYYY-MM-DD HH24:MI:SS'), to_char(ju.selesai, 'YYYY-MM-DD HH24:MI:SS'), rm.nomor, rm.nama, sc.nomor, sc.nama, sc.url, p.gelar_dpn, p.gelar_blk " +
          "from kuliah k " +
          "left join ujian ju on k.nomor=ju.kuliah " +
          "left join matakuliah mk on k.matakuliah=mk.nomor " +
          "left join pegawai p on ju.dosen=p.nomor " +
          "left join room_meeting rm on ju.room_meeting_id=rm.nomor " +
          "left join server_conference sc on rm.server=sc.nomor " +
          "where ju.jenis=:0 and k.tahun=:1 and k.semester=:2 and mk.jenis_schema=k.jenis_schema and ju.dosen=:3 and k.dosen is not null and ju.mulai is not null and ju.nomor=:4 " +
          "order by ju.mulai",
        [jenis, tahun, semester, nomor, nomorUjian]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jenis_ujian: jenis,
            jenis_schema: item[1],
            kode_kelas: item[2],
            pararel: item[3],
            matakuliah: {
              nomor: item[4],
              nama: item[5],
            },
            dosen: {
              nomor: item[6],
              nama: item[7],
              gelar_dpn: item[16],
              gelar_blk: item[17],
            },
            ujian: {
              nomor: item[8],
              mulai: item[9],
              mulai_indonesia:
                item[9] == null
                  ? null
                  : waktu.formatWaktu(
                      item[9],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
              selesai: item[10],
              selesai_indonesia:
                item[10] == null
                  ? null
                  : waktu.formatWaktu(
                      item[10],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
            },
            ruang: {
              nomor: item[11],
              nama: item[12],
            },
            server: {
              nomor: item[13],
              nama: item[14],
              url: item[15],
            },
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  editJadwalUjian: (conn, mulai, selesai, room, nomor) => {
    return conn
      .execute(
        "update ujian set mulai=to_date(:0, 'YYYY-MM-DD HH24:MI:SS'), selesai=to_date(:1, 'YYYY-MM-DD HH24:MI:SS'), room_meeting_id=:2 where nomor=:3",
        [mulai, selesai, room, nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update jadwal ujian", err);
        return false;
      });
  },
  editJadwalUjianDosen: (conn, selesai, nomor) => {
    return conn
      .execute(
        "update ujian set selesai=to_date(:0, 'YYYY-MM-DD HH24:MI:SS') where nomor=:1",
        [selesai, nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update jadwal ujian dosen", err);
        return false;
      });
  },
  editTanggalUjian: (conn, mulai, selesai, nomor) => {
    return conn
      .execute(
        "update ujian set mulai=to_date(:0, 'YYYY-MM-DD HH24:MI:SS'), selesai=to_date(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
        [mulai, selesai, nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update tanggal ujian", err);
        return false;
      });
  },
  editDosen: (conn, dosen, nomor) => {
    return conn
      .execute("update ujian set dosen=:0 where nomor=:1", [dosen, nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update Dosen", err);
        return false;
      });
  },
  getListKuliah: (conn, tahun, semester) => {
    return conn
      .execute("select * from kuliah k where k.tahun=:0 and k.semester =:1 ", [
        tahun,
        semester,
      ])
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tahun: item[1],
            semester: item[2],
            matakuliah: item[3],
            hari: item[4],
            jam: item[5],
            ruang: item[6],
            hari_2: item[7],
            jam_2: item[8],
            ruang_2: item[9],
            dosen: item[10],
            asisten: item[11],
            teknisi: item[12],
            kode_kelas: item[13],
            pararel: item[14],
            jenis_schema: item[15],
            kuliah_gabungan: item[16],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  saveJadwal: (conn, dataJadwal, index, jenis) => {
    return conn
      .execute(
        "insert into ujian (nomor, jenis, kuliah, jenis_schema, dosen, mulai, selesai, room_meeting_id) values (nujian.nextval, :0, :1, :2, :3, to_date(:4, 'YYYY-MM-DD HH24:MI:SS'), to_date(:5, 'YYYY-MM-DD HH24:MI:SS'), :6)",
        [
          jenis,
          dataJadwal.nomor_k,
          dataJadwal.jenis_schema,
          dataJadwal.dosen,
          dataJadwal.mulai,
          dataJadwal.selesai,
          dataJadwal.convertRuang,
        ],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("insert jadwal " + index, err);
        // console.log("---------------------------------");
        // console.log("mulai " + dataJadwal.mulai);
        // console.log("selesai " + dataJadwal.selesai);
        return false;
      });
  },
  bersihkanJadwal: (conn, tahun, semester, jenis) => {
    return conn
      .execute(
        "delete from ujian u2 " +
          "where u2.nomor in ( " +
          "select u.nomor from ujian u " +
          "join kuliah k on k.nomor  = u.kuliah and k.jenis_schema = u.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and u.jenis=:2 " +
          ") ",
        [tahun, semester, jenis],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("hapus jadwal", err);
        return false;
      });
  },
  getFileExtensionSoalMIS: (conn, kuliah, jenisSchema, jenis) => {
    return conn
      .execute(
        "select file_extension " +
          "from soal@mis " +
          "where kuliah=:0 and jenis_schema=:1 and jenis=:2 ",
        [parseInt(kuliah), parseInt(jenisSchema), parseInt(jenis)]
      )
      .then((res) => {
        if (res.rows.length == 0) {
          return null;
        } else {
          return res.rows[0][0];
        }
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getBlobSoalMIS: (conn, kuliah, jenisSchema, jenis) => {
    return conn
      .execute(
        "select file_soal from soal_split@mis where kuliah=:0 and jenis=:1 and jenis_schema=:2 order by urut asc",
        [parseInt(kuliah), parseInt(jenis), parseInt(jenisSchema)]
      )
      .then((res) => {
        let file_soal = "";
        res.rows.forEach((item) => {
          file_soal += item[0];
        });
        return file_soal;
      })
      .catch((err) => {
        return null;
      });
  },
  updatePathSoal: (conn, urlSoal, nomorUjian) => {
    return conn
      .execute(
        "update ujian set url_soal=:0 where nomor=:1",
        [urlSoal, parseInt(nomorUjian)],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("updatePathSoal ujian", err);
        return false;
      });
  },
  getHasilUjianByNomorUjian: (conn, nomor) => {
    return conn
      .execute(
        "select um.nomor, to_char(um.tgl_upload, 'YYYY-MM-DD HH24:MI:SS'), um.url_jawaban, um.tgl_dinilai, um.nilai, m.nrp, m.nama, um.keterangan " +
          "from ujian_mhs um " +
          "left join (select nomor, nama, nrp from mahasiswa) m on um.mahasiswa=m.nomor " +
          "where um.ujian=:0 order by um.tgl_upload asc",
        [nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tgl_upload: item[1],
            tgl_upload_indonesia:
              item[1] == null
                ? null
                : waktu.formatWaktu(
                    item[1],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            url_jawaban: process.env.BASE_URL + "/" + item[2],
            tgl_dinilai: item[3],
            tgl_dinilai_indonesia:
              item[3] == null
                ? null
                : waktu.formatWaktu(
                    item[3],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            nilai: item[4],
            nrp: item[5],
            nama: item[6],
            keterangan: item[7],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getJawabanMahasiswa: (conn, nomor, mahasiswa) => {
    return conn
      .execute(
        "select um.nomor, to_char(um.tgl_upload, 'YYYY-MM-DD HH24:MI:SS'), to_char(um.tgl_dinilai, 'YYYY-MM-DD HH24:MI:SS'), um.url_jawaban, um.keterangan, um.nilai from ujian_mhs um where um.ujian=:0 and um.mahasiswa=:1 ",
        [nomor, mahasiswa]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tgl_upload: item[1],
            tgl_upload_indonesia:
              item[1] == null
                ? null
                : waktu.formatWaktu(
                    item[1],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            tgl_dinilai: item[2],
            tgl_dinilai_indonesia:
              item[2] == null
                ? null
                : waktu.formatWaktu(
                    item[2],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            url_jawaban: process.env.BASE_URL + "/" + item[3],
            keterangan: item[4],
            nilai: item[5],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  cekJawaban: (conn, ujian, mahasiswa) => {
    return conn
      .execute("select nomor from ujian_mhs where ujian=:0 and mahasiswa=:1", [
        ujian,
        mahasiswa,
      ])
      .then((res) => {
        if (res.rows.length) {
          return res.rows[0][0];
        }
        return null;
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  },
  simpanJawaban: (conn, ujian, mahasiswa, tglUpload, urlJawaban) => {
    return conn
      .execute(
        "insert into ujian_mhs (nomor, ujian, mahasiswa, tgl_upload, url_jawaban) " +
          "values (nujian_mhs.nextval, :0, :1, to_date(:2, 'YYYY-MM-DD HH24:MI:SS'), :3)",
        [ujian, mahasiswa, tglUpload, urlJawaban],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log(err);
        return null;
      });
  },
  updateJawaban: (conn, tglUpload, urlJawaban, nomorUjianMhs) => {
    return conn
      .execute(
        "update ujian_mhs set tgl_upload=to_date(:0, 'YYYY-MM-DD HH24:MI:SS'), url_jawaban=:2 where nomor=:3",
        [tglUpload, urlJawaban, nomorUjianMhs],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log(err);
        return null;
      });
  },
  updateCatatanNilai: async (
    conn,
    nomor_ujian_mahasiswa,
    catatanDosen,
    nilai,
    waktu
  ) => {
    return conn
      .execute(
        "update ujian_mhs set keterangan=:0, nilai=:1, tgl_dinilai=TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS') where nomor=:3",
        [catatanDosen, nilai, waktu, nomor_ujian_mahasiswa],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("updateCatatanNilai Ujian", err);
        return false;
      });
  },
};
