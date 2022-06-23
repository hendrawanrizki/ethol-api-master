const waktu = require("../helper/waktu");
module.exports = {
  rekapAdminBaak: (conn, tahun, bulan, jurusan, program) => {
    return conn
      .execute(
        "select  k.nomor, k.jenis_schema, p.nama, p.gelar_dpn, p.gelar_blk, mk.matakuliah, k.kode_kelas, k.pararel, pr.jumlah, p.nip, p.nomor " +
          "from ( " +
          "select pd.kuliah,pd.jenis_schema, pd.dosen, extract(year from pd.tanggal) tahun, extract(month from pd.tanggal) bulan, count(*) jumlah " +
          "from presensi_dosen pd " +
          "where extract(year from pd.tanggal) = :0 and extract(month from pd.tanggal) = :1 " +
          "group by pd.kuliah, pd.jenis_schema, pd.dosen, extract(year from pd.tanggal), extract(month from pd.tanggal) " +
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
  rekapDosen: (conn, tahun, semester, dosen) => {
    return conn
      .execute(
        "select k.nomor, mk.matakuliah, k.kode_kelas, k.pararel, k.jenis_schema, p.total " +
          "from kuliah k " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "left join (select kuliah, jenis_schema, count(nomor) as total from presensi_dosen group by kuliah, jenis_schema) p on k.nomor=p.kuliah and k.jenis_schema=p.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and k.dosen=:2 ",
        [tahun, semester, dosen]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            kuliah: item[0],
            matakuliah: item[1],
            kelas: item[2] + " - " + item[3],
            jenis_schema: item[4],
            jumlah: item[5],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        console.log("model");
        return [];
      });
  },
  tanggalPresensiDosenPerBulan: (conn, tahun, bulan, dosen, kuliah) => {
    return conn
      .execute(
        "select * from presensi_dosen pd " +
          "where extract(year from pd.tanggal) = :0 and extract(month from pd.tanggal) = :1  AND pd.dosen =:2 AND pd.KULIAH =:3 " +
          "ORDER BY pd.TANGGAL DESC ",
        [parseInt(tahun), parseInt(bulan), parseInt(dosen), parseInt(kuliah)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah: item[1],
            jenis_schema: item[2],
            dosen: item[3],
            waktu: item[4],
            waktu_indonesia: waktu.formatWaktu(
              item[4],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            open: item[5],
            key: item[6],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  tanggalPresensiDosenPerSemester: (conn, tahun, semester, kuliah, dosen) => {
    return conn
      .execute(
        "select pd.* from presensi_dosen pd " +
          "left join kuliah k on k.nomor = pd.kuliah  and k.jenis_schema = pd.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and k.nomor=:2 and k.dosen=:3 " +
          "order by pd.tanggal desc ",
        [parseInt(tahun), parseInt(semester), parseInt(kuliah), parseInt(dosen)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah: item[1],
            jenis_schema: item[2],
            dosen: item[3],
            waktu: item[4],
            waktu_indonesia: waktu.formatWaktu(
              item[4],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            open: item[5],
            key: item[6],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  jumlahMahasiswaPerKuliah: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select count(*) jumlah from ( " +
          "select count(m.nrp) jumlah from kuliah k " +
          "join mahasiswa_semester ms on ms.kuliah  = k.nomor and ms.jenis_schema = k.jenis_schema " +
          "join mahasiswa m on m.nomor  = ms.mahasiswa " +
          "where k.nomor =:0 and k.jenis_schema =:1 " +
          "group by m.nrp " +
          ") jml",
        [parseInt(kuliah), parseInt(jenis_schema)]
      )
      .then((res) => {
        return {
          jumlah: res.rows[0][0],
        };
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  daftarMahasiswaHadirKuliah: (conn, key) => {
    return conn
      .execute(
        "select pm.tanggal, m.* from presensi_mahasiswa pm " +
          "left join (select m2.nomor, m2.nrp,m2.nama,m2.notelp, m2.jenis_kelamin from mahasiswa m2) m on m.nomor = pm.mahasiswa " +
          "where pm.key =: 0 " +
          "order by tanggal asc ",
        [key]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            waktu: item[0],
            waktu_indonesia: waktu.formatWaktu(
              item[0],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            pukul: waktu.formatWaktu(item[0], "YYYY-MM-DD HH:mm:ss", "HH:mm"),
            nomor: item[1],
            nrp: item[2],
            nama: item[3],
            hp: item[4],
            jenis_kelamin: item[5],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  daftarMahasiswaTidakHadirKuliah: (conn, kuliah, jenis_schema, key) => {
    return conn
      .execute(
        "select * from ( " +
          "select m.*, ms.kuliah_asal from kuliah k " +
          "join mahasiswa_semester ms on ms.kuliah  = k.nomor and ms.jenis_schema = k.jenis_schema " +
          "join (select m2.nomor, m2.nrp, m2.nama, m2.notelp, m2.jenis_kelamin from mahasiswa m2) m on m.nomor  = ms.mahasiswa " +
          "where k.nomor =:0 and k.jenis_schema =:1 " +
          ") where nrp not in ( " +
          "select m.nrp from presensi_mahasiswa pm " +
          "left join (select m2.nomor, m2.nrp,m2.nama,m2.notelp, m2.jenis_kelamin from mahasiswa m2) m on m.nomor = pm.mahasiswa " +
          "where pm.key =:2 " +
          ") " +
          "order by nama ",
        [kuliah, jenis_schema, key]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nrp: item[1],
            nama: item[2],
            hp: item[3],
            jenis_kelamin: item[4],
            kuliah_asal: item[5],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  historyPresensiMahasiswa: (conn, kuliah, jenis_schema, nomorMahasiswa) => {
    return conn
      .execute(
        "select nomor, to_char(tanggal, 'DD-MM-YYYY HH24:MI:SS'), key " +
          "from presensi_mahasiswa " +
          "where kuliah=:0 and jenis_schema=:1 and mahasiswa=:2 order by nomor desc",
        [kuliah, jenis_schema, nomorMahasiswa]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tanggal: item[1],
            waktu_indonesia: waktu.formatWaktu(
              item[1],
              "DD-MM-YYYY HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm:ss"
            ),
            key: item[2],
          };
        })
      )
      .catch((err) => {
        console.log("historyPresensiMahasiswa", err);
        return [];
      });
  },
  historyPresensiDosen: (conn, kuliah, jenis_schema, nomorDosen) => {
    return conn
      .execute(
        "select pd.nomor, to_char(pd.tanggal, 'DD-MM-YYYY HH24:MI:SS'), pd.open, pd.key, pm.total " +
          "from presensi_dosen pd left join ( select kuliah, jenis_schema, key, count(mahasiswa) as total from presensi_mahasiswa where kuliah=:0 and jenis_schema=:1 group by kuliah, jenis_schema, key) pm " +
          "on pd.key=pm.key and pd.kuliah=pm.kuliah where pd.kuliah=:2 and pd.dosen=:3 and pd.jenis_schema=:4 order by pd.nomor desc",
        [kuliah, jenis_schema, kuliah, nomorDosen, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tanggal: item[1],
            waktu_indonesia: waktu.formatWaktu(
              item[1],
              "DD-MM-YYYY HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm:ss"
            ),
            open: item[2] === 1,
            key: item[3],
            total: item[4],
          };
        })
      )
      .catch((err) => {
        console.log("historyPresensiDosen", err);
        return [];
      });
  },
  simpanDosen: (conn, kuliah, jenis_schema, dosen, key, tanggal) => {
    return conn
      .execute(
        "insert into presensi_dosen (nomor, kuliah, jenis_schema, dosen, tanggal, open, key) values (npresensi_dosen.nextval, :0, :1, :2, to_date(:3, 'YYYY-MM-DD HH24:MI:SS'), :4, :5)",
        [kuliah, jenis_schema, dosen, tanggal, 1, key],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected > 0)
      .catch((err) => {
        console.log("simpanDosen Presensi", err);
        return false;
      });
  },
  simpanMahasiswa: (
    conn,
    kuliah,
    jenis_schema,
    mahasiswa,
    key,
    tanggal,
    kuliah_asal
  ) => {
    return conn
      .execute(
        "insert into presensi_mahasiswa (nomor, kuliah, jenis_schema, mahasiswa, tanggal, key, kuliah_asal) values (npresensi_mahasiswa.nextval, :0, :1, :2, to_date(:3, 'YYYY-MM-DD HH24:MI:SS'), :4, :5)",
        [kuliah, jenis_schema, mahasiswa, tanggal, key, kuliah_asal],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected > 0)
      .catch((err) => {
        console.log("simpanMahasiswa Presensi", err);
        return false;
      });
  },
  cekPresensiAktifDosen: (conn, dosen) => {
    return conn
      .execute("select nomor from presensi_dosen where open=1 and dosen=:0", [
        dosen,
      ])
      .then((res) => res.rows.length > 0)
      .catch((err) => {
        console.log("cekPresensiAktifDosen Presensi", err);
        return true;
      });
  },
  cekPresesiAktifKuliah: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select kuliah, key, jenis_schema, open from presensi_dosen where open=:0 and kuliah=:1 and jenis_schema=:2",
        [1, kuliah, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            kuliah: item[0],
            key: item[1],
            jenisSchema: item[2],
            open: item[3],
          };
        })
      )
      .catch((err) => {
        console.log("cekPresensiAktifDosen Presensi", err);
        return [];
      });
  },
  cekPresensiTerakhir: (conn, dosen) => {
    return conn
      .execute(
        "select to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS'), kuliah, jenis_schema from presensi_dosen where dosen=:0 order by nomor desc",
        [dosen]
      )
      .then((res) => {
        if (res.rows.length == 0) {
          return {
            tanggal: null,
            kuliah: null,
            jenisSchema: null,
          };
        } else {
          return {
            tanggal: res.rows[0][0],
            kuliah: res.rows[0][1],
            jenisSchema: res.rows[0][2],
          };
        }
      })
      .catch((err) => {
        console.log("cekPresensiTerakhir Presensi", err);
        return null;
      });
  },
  cekPresensiKuliahTerakhir: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select to_char(tanggal, 'YYYY-MM-DD HH24:MI:SS'), kuliah, jenis_schema, key, open from presensi_dosen where kuliah=:0 and jenis_schema=:1 order by nomor desc",
        [kuliah, jenis_schema]
      )
      .then((res) => {
        return {
          tanggal: res.rows[0][0],
          kuliah: res.rows[0][1],
          jenisSchema: res.rows[0][2],
          key: res.rows[0][3],
          open: res.rows[0][4] === 1,
        };
      })
      .catch((err) => {
        console.log("cekPresensiKuliahTerakhir Presensi", err);
        return null;
      });
  },
  cekPresensiMasihTerbuka: (conn, kuliah, jenis_schema, key) => {
    return conn
      .execute(
        "select open from presensi_dosen where kuliah=:0 and jenis_schema=:1 and key=:2",
        [kuliah, jenis_schema, key]
      )
      .then((res) => res.rows[0][0] === 1)
      .catch((err) => {
        console.log("cekPresensiMasihTerbuka Presensi", err);
        return false;
      });
  },
  cekSudahPresensi: (conn, kuliah, jenis_schema, key, mahasiswa) => {
    return conn
      .execute(
        "select nomor from presensi_mahasiswa where kuliah=:0 and jenis_schema=:1 and key=:2 and mahasiswa=:3",
        [kuliah, jenis_schema, key, mahasiswa]
      )
      .then((res) => res.rows.length > 0)
      .catch((err) => {
        console.log("cekSudahPresensi Presensi", err);
        return true;
      });
  },
  tutup: (conn, nomor) => {
    return conn
      .execute("update presensi_dosen set open=:0 where nomor=:1", [0, nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected > 0)
      .catch((err) => {
        console.log("tutup Presensi", err);
        return null;
      });
  },
  hapusDosen: (conn, kuliah, jenis_schema, key) => {
    return conn
      .execute(
        "delete from presensi_dosen where kuliah=:0 and jenis_schema=:1 and key=:2",
        [kuliah, jenis_schema, key],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected > 0)
      .catch((err) => {
        console.log("hapusDosen Presensi", err);
        return null;
      });
  },
  hapusMahasiswa: (conn, kuliah, jenis_schema, key) => {
    return conn
      .execute(
        "delete from presensi_mahasiswa where kuliah=:0 and jenis_schema=:1 and key=:2",
        [kuliah, jenis_schema, key],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected > 0)
      .catch((err) => {
        console.log("hapusMahasiswa Presensi", err);
        return null;
      });
  },
};
