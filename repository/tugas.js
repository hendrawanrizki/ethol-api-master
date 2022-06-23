const waktu = require("../helper/waktu");
module.exports = {
  jmlMahasiswaMengerjakan: (conn, idTugas) => {
    return conn
      .execute("select count(*) from tugas_mhs where tugas=:0", [idTugas])
      .then((res) => {
        if (res.rows.length == 0) return null;
        return res.rows[0][0];
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  },
  fileTugasDosen: (conn, idTugas) => {
    return conn
      .execute("select nomor, nama_file from tugas_file where tugas=:0", [
        idTugas,
      ])
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            path: process.env.BASE_URL + "/" + item[1],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  jumlahMahasiswa: (conn, kuliah) => {
    return conn
      .execute("select count(*) from mahasiswa_semester where kuliah=:0", [
        kuliah,
      ])
      .then((res) => {
        if (res.rows.length == 0) return null;
        return res.rows[0][0];
      })
      .catch((err) => {
        console.log(err);
        return null;
      });
  },
  getDataDosen: (conn, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select nomor, judul, catatan, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS'), to_char(tanggal_entri, 'YYYY-MM-DD HH24:MI:SS') from tugas where kuliah=:0 and jenis_schema=:1 order by tanggal desc",
        [kuliah, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            title: item[1],
            description: item[2],
            deadline: item[3],
            deadline_indonesia: waktu.formatWaktu(
              item[3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            created: item[4],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataTugasByNomorTugas: (conn, nomorTugas) => {
    return conn
      .execute(
        "select t.nomor, t.judul, t.catatan, to_char(t.tanggal, 'yyyy-mm-dd hh24:mi:ss'), to_char(t.tanggal_entri, 'yyyy-mm-dd hh24:mi:ss'), t.kuliah, t.jenis_schema, m.matakuliah " +
          "from tugas t " +
          "join kuliah k on k.nomor = t.kuliah and k.jenis_schema = t.jenis_schema " +
          "join matakuliah m on m.nomor = k.matakuliah and m.jenis_schema = k.jenis_schema " +
          "where t.nomor=:0 order by tanggal desc ",
        [nomorTugas]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            title: item[1],
            description: item[2],
            deadline: item[3],
            deadline_indonesia: waktu.formatWaktu(
              item[3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            created: item[4],
            kuliah: item[5],
            jenisSchema: item[6],
            matakuliah: item[7],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataMahasiswa: (conn, kuliah, mahasiswa, jenisSchema) => {
    return conn
      .execute(
        "select t.nomor, t.judul, t.catatan, to_char(t.tanggal, 'YYYY-MM-DD HH24:MI:SS'), to_char(t.tanggal_entri, 'YYYY-MM-DD HH24:MI:SS'),  tf.nama_file, tm.catatan, tm.nilai, tm.tanggal_koreksi, tm.catatan_dosen, tfm.nama_file, tfm.tanggal, tm.nomor, tfm.nomor " +
          "from tugas t full outer join tugas_file tf on t.nomor=tf.tugas full outer join " +
          "(select nomor, tugas, catatan, mahasiswa, nilai, catatan_dosen, to_char(tanggal_koreksi, 'YYYY-MM-DD HH24:MI:SS') as tanggal_koreksi from tugas_mhs where mahasiswa=:0) tm on t.nomor=tm.tugas full outer join " +
          "(select nomor, tugas, nama_file, mahasiswa, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS') as tanggal from tugas_file_mhs where mahasiswa=:1) tfm on t.nomor=tfm.tugas " +
          "where t.kuliah=:2 and t.jenis_schema=:3 order by t.tanggal desc",
        [mahasiswa, mahasiswa, kuliah, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            kuliah: parseInt(kuliah),
            title: item[1],
            description: item[2],
            deadline: item[3],
            deadline_indonesia: waktu.formatWaktu(
              item[3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            created: item[4],
            file: process.env.BASE_URL + "/" + item[5],
            student_note: item[6],
            grade: item[7],
            correction_date: item[8],
            correction_date_indonesia:
              item[8] == null
                ? null
                : waktu.formatWaktu(
                    item[8],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            lecturer_note: item[9],
            submission_file: process.env.BASE_URL + "/" + item[10],
            submission_time: item[11],
            submission_time_indonesia:
              item[11] == null
                ? null
                : waktu.formatWaktu(
                    item[11],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            nomor_tugas_mahasiswa: item[12],
            nomor_tugas_file_mahasiswa: item[13],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataMahasiswaByNomorTugas: (conn, mahasiswa, nomorTugas) => {
    return conn
      .execute(
        "select t.nomor, t.judul, t.catatan, to_char(t.tanggal, 'YYYY-MM-DD HH24:MI:SS'), to_char(t.tanggal_entri, 'YYYY-MM-DD HH24:MI:SS'),  tf.nama_file, tm.catatan, tm.nilai, tm.tanggal_koreksi, tm.catatan_dosen, tfm.nama_file, tfm.tanggal, tm.nomor, tfm.nomor, t.kuliah, t.jenis_schema " +
          "from tugas t full outer join tugas_file tf on t.nomor=tf.tugas full outer join " +
          "(select nomor, tugas, catatan, mahasiswa, nilai, catatan_dosen, to_char(tanggal_koreksi, 'YYYY-MM-DD HH24:MI:SS') as tanggal_koreksi from tugas_mhs where mahasiswa=:0) tm on t.nomor=tm.tugas full outer join " +
          "(select nomor, tugas, nama_file, mahasiswa, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS') as tanggal from tugas_file_mhs where mahasiswa=:1) tfm on t.nomor=tfm.tugas " +
          "where t.nomor=:2 order by t.tanggal desc",
        [mahasiswa, mahasiswa, nomorTugas]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            kuliah: item[14],
            title: item[1],
            description: item[2],
            deadline: item[3],
            deadline_indonesia: waktu.formatWaktu(
              item[3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            created: item[4],
            file: process.env.BASE_URL + "/" + item[5],
            student_note: item[6],
            grade: item[7],
            correction_date: item[8],
            correction_date_indonesia:
              item[8] == null
                ? null
                : waktu.formatWaktu(
                    item[8],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            lecturer_note: item[9],
            submission_file: process.env.BASE_URL + "/" + item[10],
            submission_time: item[11],
            submission_time_indonesia:
              item[11] == null
                ? null
                : waktu.formatWaktu(
                    item[11],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            nomor_tugas_mahasiswa: item[12],
            nomor_tugas_file_mahasiswa: item[13],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  simpanTugas: async (
    conn,
    idK,
    judul,
    deskripsi,
    tglDeadline,
    savePath,
    jenisSchema
  ) => {
    try {
      let simpanTugas = await conn
        .execute(
          "select last_number from user_sequences where sequence_name='NTUGAS'"
        )
        .then(async (res) => {
          let idTugas = res.rows[0][0];
          let saveTugas = await conn.execute(
            "insert into tugas VALUES (ntugas.nextval, :0, :1, :2, TO_DATE(:3, 'YYYY-MM-DD HH24:MI:SS'), sysdate, :4)",
            [idK, judul, deskripsi, tglDeadline, jenisSchema],
            {
              autoCommit: true,
            }
          );
          if (savePath != null) {
            let saveFile = await conn.execute(
              "insert into tugas_file VALUES (ntugas_file.nextval, :0, :1, sysdate)",
              [idTugas, savePath],
              {
                autoCommit: true,
              }
            );
          }
          return {
            sukses: true,
            nomorTugas: idTugas,
          };
        });
      return simpanTugas;
    } catch (error) {
      console.log("error simpan tugas", error);
      return {
        sukses: false,
        nomorTugas: null,
      };
    }
  },
  updateTugas: async (
    conn,
    nomorTugas,
    judul,
    deskripsi,
    tglDeadline,
    savePath
  ) => {
    await conn
      .execute(
        "update tugas set judul=:0, catatan=:1, tanggal=TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS') where nomor=:3",
        [judul, deskripsi, tglDeadline, nomorTugas],
        { autoCommit: true }
      )
      .then(async (resTugas) => {
        await conn
          .execute(
            "update tugas_file set nama_file=:0 where tugas=:1",
            [savePath, nomorTugas],
            { autoCommit: true }
          )
          .then((res) => {
            return true;
          })
          .catch((err) => {
            console.log("update tugas_file", err);
            return false;
          });
      })
      .catch((err) => {
        console.log("updateTugas", err);
        return false;
      });
  },
  updateTugasNoFile: async (
    conn,
    nomorTugas,
    judul,
    deskripsi,
    tglDeadline
  ) => {
    return await conn
      .execute(
        "update tugas set judul=:0, catatan=:1, tanggal=TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS') where nomor=:3",
        [judul, deskripsi, tglDeadline, nomorTugas],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update updateTugasNoFile", err);
        return false;
      });
  },
  hapusData: async (conn, nomor) => {
    try {
      await conn
        .execute("delete from tugas where nomor=:0", [nomor], {
          autoCommit: true,
        })
        .then(async (res) => {
          await conn.execute("delete from tugas_file where tugas=:0", [nomor], {
            autoCommit: true,
          });
        });
      return true;
    } catch (error) {
      console.log("hapusTugas", err);
      return false;
    }
  },
  simpanJawaban: async (conn, tugas, mahasiswa, catatan, waktu, savePath) => {
    try {
      let saveTugas = await conn.execute(
        "insert into tugas_mhs (nomor, tugas, catatan, mahasiswa, tanggal_upload) VALUES (ntugas_mhs.nextval, :0, :1, :2, TO_DATE(:3, 'YYYY-MM-DD HH24:MI:SS'))",
        [tugas, catatan, mahasiswa, waktu],
        {
          autoCommit: true,
        }
      );
      let saveFile = await conn.execute(
        "insert into tugas_file_mhs VALUES (ntugas_file_mhs.nextval, :0, :1, TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS'), :3)",
        [tugas, savePath, waktu, mahasiswa],
        {
          autoCommit: true,
        }
      );
      console.log("saveTugas", saveTugas);
      console.log("saveFile", saveFile);
      return true;
    } catch (error) {
      console.log("error simpan jawaban", error);
      return false;
    }
  },
  jawabanTugasById: (conn, tugas, mahasiswa) => {
    return conn
      .execute(
        "select t.nomor, t.judul, t.catatan, to_char(t.tanggal, 'YYYY-MM-DD HH24:MI:SS'), to_char(t.tanggal_entri, 'YYYY-MM-DD HH24:MI:SS'),  tf.nama_file, tm.catatan, tm.nilai, tm.tanggal_koreksi, tm.catatan_dosen, tfm.nama_file, tfm.tanggal, tm.nomor, tfm.nomor " +
          "from tugas t full outer join tugas_file tf on t.nomor=tf.tugas full outer join " +
          "(select nomor, tugas, catatan, mahasiswa, nilai, catatan_dosen, to_char(tanggal_koreksi, 'YYYY-MM-DD HH24:MI:SS') as tanggal_koreksi from tugas_mhs where mahasiswa=:0) tm on t.nomor=tm.tugas full outer join " +
          "(select nomor, tugas, nama_file, mahasiswa, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS') as tanggal from tugas_file_mhs where mahasiswa=:1) tfm on t.nomor=tfm.tugas " +
          "where t.nomor=:2 order by t.tanggal desc",
        [mahasiswa, mahasiswa, tugas]
      )
      .then((res) => {
        if (res.rows.length != 0) {
          return {
            success: true,
            message: "Data berhasil ditemukan",
            id: res.rows[0][0],
            title: res.rows[0][1],
            description: res.rows[0][2],
            deadline: res.rows[0][3],
            deadline_indonesia: waktu.formatWaktu(
              res.rows[0][3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            created: res.rows[0][4],
            file: process.env.BASE_URL + "/" + res.rows[0][5],
            student_note: res.rows[0][6],
            grade: res.rows[0][7],
            correction_date: res.rows[0][8],
            correction_date_indonesia:
              res.rows[0][8] == null
                ? null
                : waktu.formatWaktu(
                    res.rows[0][8],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            lecturer_note: res.rows[0][9],
            submission_file: process.env.BASE_URL + "/" + res.rows[0][10],
            submission_time: res.rows[0][11],
            submission_time_indonesia:
              res.rows[0][11] == null
                ? null
                : waktu.formatWaktu(
                    res.rows[0][11],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            nomor_tugas_mahasiswa: res.rows[0][12],
            nomor_tugas_file_mahasiswa: res.rows[0][13],
          };
        } else {
          return {
            success: false,
            message: "Data tidak ditemukan",
          };
        }
      })
      .catch((err) => {
        console.log("error jawabanTugasById", err);
        return {
          success: false,
          message: "Data tidak ditemukan",
        };
      });
  },
  updateJawaban: async (
    conn,
    catatan,
    waktu,
    savePath,
    nomor_tugas_mahasiswa,
    nomor_tugas_file_mahasiswa
  ) => {
    return conn
      .execute(
        "update tugas_mhs set catatan=:0, tanggal_upload=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
        [catatan, waktu, nomor_tugas_mahasiswa],
        { autoCommit: true }
      )
      .then(async (resTugas) => {
        await conn
          .execute(
            "update tugas_file_mhs set nama_file=:0, tanggal=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
            [savePath, waktu, nomor_tugas_file_mahasiswa],
            { autoCommit: true }
          )
          .then((res) => {
            return true;
          })
          .catch((err) => {
            console.log("updateJawaban", err);
            return false;
          });
      })
      .catch((err) => {
        console.log("updateJawaban", err);
        return false;
      });
  },
  updateJawabanNoFile: async (conn, catatan, waktu, nomor_tugas_mahasiswa) => {
    return conn
      .execute(
        "update tugas_mhs set catatan=:0, tanggal_upload=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
        [catatan, waktu, nomor_tugas_mahasiswa],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("updateJawaban", err);
        return false;
      });
  },
  pekerjaanMahasiswa: (conn, idTugas) => {
    return conn
      .execute(
        "select tm.nomor, tm.catatan, tm.nilai, tm.catatan_dosen, to_char(tm.tanggal_koreksi, 'yyyy-mm-dd hh24:mi:ss'), m.nomor, m.nrp, m.nama, tfm.nama_file, to_char(tfm.tanggal, 'yyyy-mm-dd hh24:mi:ss') from tugas_mhs tm " +
          "join tugas_file_mhs tfm on tfm.mahasiswa=tm.mahasiswa and tfm.tugas=tm.tugas " +
          "join (select nomor, nrp, nama from mahasiswa) m on tm.mahasiswa=m.nomor " +
          "where tm.tugas=:0 order by tfm.tanggal ",
        [idTugas]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            student_note: item[1],
            grade: item[2],
            lecturer_note: item[3],
            correction_date: item[4],
            correction_date_indonesia:
              item[4] == null
                ? null
                : waktu.formatWaktu(
                    item[4],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            student_id: item[5],
            student_nrp: item[6],
            student_name: item[7],
            file: process.env.BASE_URL + "/" + item[8],
            created: item[9],
            created_indonesia: waktu.formatWaktu(
              item[9],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  updateCatatanNilai: async (
    conn,
    nomor_tugas_mahasiswa,
    catatanDosen,
    nilai,
    waktu
  ) => {
    return conn
      .execute(
        "update tugas_mhs set catatan_dosen=:0, nilai=:1, tanggal_koreksi=TO_DATE(:2, 'YYYY-MM-DD HH24:MI:SS') where nomor=:3",
        [catatanDosen, nilai, waktu, nomor_tugas_mahasiswa],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("updateCatatanNilai", err);
        return false;
      });
  },
  updateCatatanSaja: async (
    conn,
    nomor_tugas_mahasiswa,
    catatanDosen,
    waktu
  ) => {
    return conn
      .execute(
        "update tugas_mhs set catatan_dosen=:0, tanggal_koreksi=TO_DATE(:1, 'YYYY-MM-DD HH24:MI:SS') where nomor=:2",
        [catatanDosen, waktu, nomor_tugas_mahasiswa],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("updateCatatanSaja", err);
        return false;
      });
  },
  tugasTerakhirMahasiswa: async (conn, mahasiswa, kuliah) => {
    const tasks = [];
    let task;
    for (let i = 0; i < kuliah.length; i++) {
      let nomorKuliah = kuliah[i].nomor;
      task = await conn
        .execute(
          "select t.nomor, t.judul, t.catatan, t.tanggal, t.tanggal_entri,  tf.nama_file, tm.catatan, tm.nilai, tm.tanggal_koreksi, tm.catatan_dosen, tfm.nama_file, tfm.tanggal, tm.nomor, tfm.nomor " +
            "from (select * from (select nomor, kuliah, judul, catatan, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS') as tanggal, to_char(tanggal_entri, 'YYYY-MM-DD HH24:MI:SS') as tanggal_entri from tugas where kuliah=:0 order by nomor desc) where ROWNUM<=1) t full outer join tugas_file tf on t.nomor=tf.tugas full outer join " +
            "(select nomor, tugas, catatan, mahasiswa, nilai, catatan_dosen, to_char(tanggal_koreksi, 'YYYY-MM-DD HH24:MI:SS') as tanggal_koreksi from tugas_mhs where mahasiswa=:1) tm on t.nomor=tm.tugas full outer join " +
            "(select nomor, tugas, nama_file, mahasiswa, to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS') as tanggal from tugas_file_mhs where mahasiswa=:2) tfm on t.nomor=tfm.tugas " +
            "where t.kuliah=:3",
          [parseInt(nomorKuliah), mahasiswa, mahasiswa, parseInt(nomorKuliah)]
        )
        .then((res) => {
          if (res.rows.length == 0) {
            return null;
          } else {
            let fileDosen = res.rows[0][5];
            if (fileDosen == null) {
              fileDosen = [];
            } else {
              fileDosen = [
                {
                  id: res.rows[0][12],
                  path: process.env.BASE_URL + "/" + res.rows[0][5],
                },
              ];
            }
            return {
              id: res.rows[0][0],
              course: kuliah[i].nomor,
              title: res.rows[0][1],
              description: res.rows[0][2],
              deadline: res.rows[0][3],
              deadline_indonesia: waktu.formatWaktu(
                res.rows[0][3],
                "YYYY-MM-DD HH:mm:ss",
                "dddd, DD MMMM YYYY - HH:mm"
              ),
              created: res.rows[0][4],
              created_indonesia: waktu.formatWaktu(
                res.rows[0][4],
                "YYYY-MM-DD HH:mm:ss",
                "dddd, DD MMMM YYYY - HH:mm"
              ),

              file: fileDosen,
              student_note: res.rows[0][6],
              grade: res.rows[0][7],
              correction_date: res.rows[0][8],
              correction_date_indonesia:
                res.rows[0][8] == null
                  ? null
                  : waktu.formatWaktu(
                      res.rows[0][8],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
              lecturer_note: res.rows[0][9],
              nomor_tugas_mahasiswa: res.rows[0][12],
              nomor_tugas_file_mahasiswa: res.rows[0][13],
              submission_file: process.env.BASE_URL + "/" + res.rows[0][10],
              submission_time: res.rows[0][11],
              submission_time_indonesia:
                res.rows[0][11] == null
                  ? null
                  : waktu.formatWaktu(
                      res.rows[0][11],
                      "YYYY-MM-DD HH:mm:ss",
                      "dddd, DD MMMM YYYY - HH:mm"
                    ),
            };
          }
        });
      if (task) {
        tasks.push(task);
      }
    }
    return tasks;
  },
  rekapTugasKuliah: async (conn, kuliah, jenisSchema) => {
    const promise = await Promise.all([
      conn
        .execute(
          "select m.nomor, m.nrp, m.nama from mahasiswa m left join mahasiswa_semester ms on ms.mahasiswa=m.nomor where ms.kuliah=:0 and ms.jenis_schema=:1 order by m.nomor",
          [kuliah, jenisSchema]
        )
        .then((res) =>
          res.rows.map((item) => {
            return {
              nomor: item[0],
              nrp: item[1],
              nama: item[2],
            };
          })
        )
        .catch(() => []),
      conn
        .execute(
          "select t.nomor, tm.nomor, tm.mahasiswa, tm.nilai, 'true' mengumpulkan from tugas_mhs tm left join tugas t on t.nomor=tm.tugas where t.kuliah=:0 and t.jenis_schema=:1 order by t.nomor",
          [kuliah, jenisSchema]
        )
        .then((res) =>
          res.rows.map((item) => {
            return {
              nomor_t: item[0],
              nomor_tm: item[1],
              mahasiswa: item[2],
              nilai: item[3],
              mengumpulkan: item[4],
            };
          })
        )
        .catch(() => []),
      conn
        .execute(
          "select nomor from tugas where kuliah=:0 and jenis_schema=:1 order by nomor",
          [kuliah, jenisSchema]
        )
        .then((res) =>
          res.rows.map((item) => {
            return item[0];
          })
        )
        .catch(() => []),
    ]);
    const result = [];
    promise[0].forEach((student) => {
      let row = { ...student };
      const nilai = [...promise[1]].filter(
        (item) => item.mahasiswa === student.nomor
      );
      row[`data_nilai`] = nilai;
      result.push(row);
    });
    return { tugas: promise[2], nilai: result };
  },
  rekapAdminBaak: (conn, tahun, bulan, jurusan, program) => {
    return conn
      .execute(
        "select  k.nomor, k.jenis_schema, p.nama, p.gelar_dpn, p.gelar_blk, mk.matakuliah, k.kode_kelas, k.pararel, pr.jumlah, p.nip, p.nomor " +
          "from ( " +
          "select t.kuliah, t.jenis_schema, k.dosen, extract(year from t.tanggal_entri) tahun, extract(month from t.tanggal_entri) bulan, count(*) jumlah  from tugas t " +
          "join kuliah k on k.nomor = t.kuliah and k.jenis_schema = t.jenis_schema " +
          "where extract(year from t.tanggal_entri) = :0 and extract(month from t.tanggal_entri) = :1 " +
          "group by t.kuliah, t.jenis_schema, k.dosen, extract(year from t.tanggal_entri), extract(month from t.tanggal_entri) " +
          ") pr " +
          "left join pegawai p on pr.dosen=p.nomor " +
          "left join kuliah k on pr.kuliah=k.nomor " +
          "left join matakuliah mk on k.matakuliah=mk.nomor " +
          "where k.jenis_schema=pr.jenis_schema and k.jenis_schema=mk.jenis_schema and mk.program=:2 and mk.jurusan=:3 " +
          "order by k.kode_kelas ",
        [parseInt(tahun), parseInt(bulan), parseInt(program), parseInt(jurusan)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            kuliah: item[0],
            jenis_schema: item[1],
            nama_dosen: item[2],
            gelar_dpn: item[3],
            gelar_blk: item[4],
            matakuliah: item[5],
            kelas: item[6] + " - " + item[7],
            jumlah: item[8],
            nip_dosen: item[9],
            nomor_dosen: item[10],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  detailAdminBaak: (conn, tahun, bulan, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select t.judul, t.tanggal_entri, (select count(*) from tugas_mhs tm where tm.tugas = t.nomor) jml " +
          "from tugas t " +
          "join kuliah k on k.nomor = t.kuliah and k.jenis_schema = t.jenis_schema " +
          "where extract(year from t.tanggal_entri) = :0 and extract(month from t.tanggal_entri) = :1 and t.kuliah =:2 and t.jenis_schema=:3 " +
          "order by t.tanggal_entri desc ",
        [
          parseInt(tahun),
          parseInt(bulan),
          parseInt(kuliah),
          parseInt(jenisSchema),
        ]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            judul: item[0],
            tgl_dibuat: item[1],
            tgl_dibuat_indonesia:
              item[1] == null
                ? null
                : waktu.formatWaktu(
                    item[1],
                    "YYYY-MM-DD HH:mm:ss",
                    "dddd, DD MMMM YYYY - HH:mm"
                  ),
            jumlah: item[2],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
