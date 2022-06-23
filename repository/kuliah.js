const waktu = require("../helper/waktu");
const moment = require("moment");
moment.locale("id");
module.exports = {
  dosen: (conn, nomorDosen, tahun, semester) => {
    return conn
      .execute(
        "select distinct kp.kuliah, k.kode_kelas, k.pararel, k.jenis_schema, mk.nomor as nomor_mk,  mk.matakuliah, k.kuliah_gabungan " +
          "from kuliah_pararel kp " +
          "left join kuliah k on k.nomor=kp.kuliah and k.jenis_schema=kp.jenis_schema " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "where kp.dosen=:0 and k.tahun=:1 and k.semester=:2",
        [nomorDosen, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          let isKuliahGabung = false;
          if (item[3] == 1 || item[3] == 4) {
            // jika kelas reguler(1) atau kurikulum MBKM(4) ada kuliah gabungan
            if (item[6] != null && item[6] != "") {
              // jika kuliah gabung tidak null dan tidak kosong
              isKuliahGabung = true;
            }
          }
          return {
            nomor: item[0],
            kelas: item[1],
            pararel: item[2],
            jenisSchema: item[3],
            matakuliah: {
              nomor: item[4],
              nama: item[5],
            },
            isKuliahGabungan: isKuliahGabung,
            kuliahGabungan: isKuliahGabung == true ? item[6] : null,
          };
        })
      )
      .catch((err) => {
        console.log("Ambil Kuliah dosen : " + err);
        return [];
      });
  },
  dosenByKuliahJs: (conn, nomorDosen, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select distinct kp.kuliah, k.kode_kelas, k.pararel, k.jenis_schema, mk.nomor as nomor_mk,  mk.matakuliah, k.kuliah_gabungan " +
          "from kuliah_pararel kp " +
          "left join kuliah k on k.nomor=kp.kuliah and k.jenis_schema=kp.jenis_schema " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "where kp.dosen=:0 and k.nomor=:1 and k.jenis_schema=:2",
        [nomorDosen, kuliah, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          let isKuliahGabung = false;
          if (item[3] == 1 || item[3] == 4) {
            // jika kelas reguler(1) atau kurikulum MBKM(4) ada kuliah gabungan
            if (item[6] != null && item[6] != "") {
              // jika kuliah gabung tidak null dan tidak kosong
              isKuliahGabung = true;
            }
          }
          return {
            nomor: item[0],
            kelas: item[1],
            pararel: item[2],
            jenisSchema: item[3],
            matakuliah: {
              nomor: item[4],
              nama: item[5],
            },
            isKuliahGabungan: isKuliahGabung,
            kuliahGabungan: isKuliahGabung == true ? item[6] : null,
          };
        })
      )
      .catch((err) => {
        console.log("Ambil Kuliah dosen : " + err);
        return [];
      });
  },
  getKelasKuliahGabungan: (conn, nomorKuliahGabungan, jenisSchema = 1) => {
    return conn
      .execute(
        "select ka.kode_kelas, ka.pararel, ka.ruang ruang_1, rk.ruang nama_ruang_1, ka.hari hari_1, h.hari nama_hari_1, j.jam jam_1, " +
          "ka.ruang_2, rk2.ruang nama_ruang_2, ka.hari_2, h2.hari nama_hari_2, j2.jam as jam_2, coalesce(mk.jam,0) as jam_kali_50 from kuliah_gabungan_detil kgd " +
          "left join kuliah_asal ka on ka.nomor = kgd.kuliah_asal and ka.jenis_schema = kgd.jenis_schema " +
          "left join matakuliah mk on ka.matakuliah=mk.nomor and ka.jenis_schema=mk.jenis_schema " +
          "left join hari h on h.nomor = ka.hari " +
          "left join hari h2 on h2.nomor = ka.hari_2 " +
          "left join ruang_kuliah rk on rk.nomor = ka.ruang " +
          "left join ruang_kuliah rk2 on rk2.nomor = ka.ruang_2 " +
          "left join jam j on ka.jam=j.nomor and j.jenis_schema = ka.jenis_schema " +
          "left join jam j2 on ka.jam_2=j2.nomor and j2.jenis_schema = ka.jenis_schema " +
          "where kgd.kuliah_gabungan =:0 and kgd.jenis_schema =:1 ",
        [nomorKuliahGabungan, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          let menit = parseInt(item[12]) * 50;
          let jam_1_akhir = null;
          let jam_2_akhir = null;
          if (item[6] != null && item[6] != "") {
            let substrJamAwal1 = item[6].substring(0, 5);
            tempConvertJamAwal_1 = moment(substrJamAwal1, "HH:mm");
            jam_1_akhir = moment(tempConvertJamAwal_1)
              .add(menit, "minutes")
              .format("HH:mm");
          }
          if (item[11] != null && item[11] != "") {
            let substrJamAwal2 = item[11].substring(0, 5);
            tempConvertJamAwal_2 = moment(substrJamAwal2, "HH:mm");
            jam_2_akhir = moment(tempConvertJamAwal_2)
              .add(menit, "minutes")
              .format("HH:mm");
          }

          let jam_1_awal = "";
          if (item[6] != null && item[6] != "") {
            jam_1_awal = item[6].substring(0, 5);
          }

          let jam_2_awal = "";
          if (item[11] != null && item[11] != "") {
            jam_2_awal = item[11].substring(0, 5);
          }

          return {
            kelas: item[0],
            pararel: item[1],
            ruang_1: item[2],
            nama_ruang_1: item[3],
            hari_1: item[4],
            nama_hari_1: item[5],
            jam_1_awal: jam_1_awal,
            jam_1_akhir: jam_1_akhir,
            ruang_2: item[7],
            nama_ruang_2: item[8],
            hari_2: item[9],
            nama_hari_2: item[10],
            jam_2_awal: jam_2_awal,
            jam_2_akhir: jam_2_akhir,
            jam_kali_50: item[12],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil Kuliah gabungan : " + err);
        return [];
      });
  },
  getKelasKuliahGabunganSimple: (
    conn,
    nomorKuliahGabungan,
    jenisSchema = 1
  ) => {
    return conn
      .execute(
        "select ka.kode_kelas, ka.pararel from kuliah_gabungan_detil kgd " +
          "left join kuliah_asal ka on ka.nomor = kgd.kuliah_asal and ka.jenis_schema = kgd.jenis_schema " +
          "where kgd.kuliah_gabungan =:0 and kgd.jenis_schema =:1 ",
        [nomorKuliahGabungan, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            kelas: item[0],
            pararel: item[1],
            jenisSchema: jenisSchema,
          };
        })
      )
      .catch((err) => {
        console.log("getKelasKuliahGabunganSimple : " + err);
        return [];
      });
  },

  mahasiswa: (conn, nomorMahasiswa, tahun, semester) => {
    return conn
      .execute(
        "select k.nomor, k.jenis_schema, mk.nomor as nomor_mk, mk.matakuliah, p.nama, p.gelar_dpn, p.gelar_blk, mk.jenis_schema, p.nip, p.nomor, k.kode_kelas, k.pararel, ms.kuliah_asal " +
          "from mahasiswa_semester ms " +
          "left join kuliah k on ms.kuliah=k.nomor and ms.jenis_schema=k.jenis_schema " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "left join pegawai p on k.dosen=p.nomor " +
          "where ms.mahasiswa=:0 and k.tahun=:1 and k.semester=:2",
        [nomorMahasiswa, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah_asal: item[12],
            jenisSchema: item[1],
            matakuliah: {
              nomor: item[2],
              nama: item[3],
              jenisSchemaMk: item[7],
            },
            dosen: item[4],
            gelar_dpn: item[5],
            gelar_blk: item[6],
            nip_dosen: item[8],
            nomor_dosen: item[9],
            kode_kelas: item[10],
            pararel: item[11],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil Kuliah mahasiswa : " + err);
        return [];
      });
  },
  mahasiswaByKuliahJs: (conn, nomorMahasiswa, kuliah, jenisSchema) => {
    return conn
      .execute(
        "select k.nomor, k.jenis_schema, mk.nomor as nomor_mk, mk.matakuliah, p.nama, p.gelar_dpn, p.gelar_blk, mk.jenis_schema, p.nip, p.nomor, k.kode_kelas, k.pararel, ms.kuliah_asal " +
          "from mahasiswa_semester ms " +
          "left join kuliah k on ms.kuliah=k.nomor and ms.jenis_schema=k.jenis_schema " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "left join pegawai p on k.dosen=p.nomor " +
          "where ms.mahasiswa=:0 and k.nomor=:1 and k.jenis_schema=:2",
        [nomorMahasiswa, kuliah, jenisSchema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah_asal: item[12],
            jenisSchema: item[1],
            matakuliah: {
              nomor: item[2],
              nama: item[3],
              jenisSchemaMk: item[7],
            },
            dosen: item[4],
            gelar_dpn: item[5],
            gelar_blk: item[6],
            nip_dosen: item[8],
            nomor_dosen: item[9],
            kode_kelas: item[10],
            pararel: item[11],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil Kuliah mahasiswa : " + err);
        return [];
      });
  },
  hariKuliahIn: (conn, kuliahs, tahun, semester) => {
    let strKuliah = "";

    if (kuliahs.length == 1) {
      for (let index = 0; index < kuliahs.length; index++) {
        const k = kuliahs[index];
        let indexPlus1 = index + 1;
        if (index == 0) {
          strKuliah += "concat(" + k.nomor + "," + k.jenisSchema + ")";
        }
      }
    } else {
      for (let index = 0; index < kuliahs.length; index++) {
        const k = kuliahs[index];
        let indexPlus1 = index + 1;
        if (index == 0) {
          strKuliah += "concat(" + k.nomor + "," + k.jenisSchema + "),";
        } else if (indexPlus1 == kuliahs.length) {
          strKuliah += "concat(" + k.nomor + "," + k.jenisSchema + ")";
        } else {
          strKuliah += "concat(" + k.nomor + "," + k.jenisSchema + "),";
        }
      }
    }
    let query = `
      select kdj.kuliah, h.hari, kdj.jam_awal, kdj.jam_akhir, h.nomor, rk.nomor nomor_ruang, rk.ruang  from kuliah_dosen_jaga kdj 
      join hari h on h.nomor  = kdj.hari 
      left join ruang_kuliah rk on kdj.room_meeting_id = rk.nomor 
      where concat(kdj.kuliah,kdj.jenis_schema) in (`;
    query += strKuliah;
    query += `)
     and kdj.tahun = ${tahun} and kdj.semester = ${semester} `;
    // console.log("query", query);
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            kuliah: item[0],
            hari: item[1],
            jam_awal: item[2],
            jam_akhir: item[3],
            nomor_hari: item[4],
            nomor_ruang: item[5],
            ruang: item[6],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil hariKuliahIn : " + err);
        return [];
      });
  },
  pesertaKuliah: (conn, kuliah, jenis_schema, checkMahasiswa) => {
    return conn
      .execute(
        "select m.nomor, m.nama, m.nrp, m.jenis_kelamin, m.notelp, m.tgllahir, k.kode, k.pararel from mahasiswa_semester ms " +
          "left join mahasiswa m on m.nomor=ms.mahasiswa " +
          "left join kelas k on k.nomor = m.kelas  " +
          "where ms.kuliah=:0 and  ms.jenis_schema=:1 order by m.nrp",
        [kuliah, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          if (checkMahasiswa == true) {
            return {
              id: item[0],
              name: item[1],
              nrp: item[2],
              jk: item[3],
            };
          } else {
            return {
              id: item[0],
              name: item[1],
              nrp: item[2],
              jk: item[3],
              hp: item[4],
              kode: item[6],
              pararel: item[7],
              tgllahir: waktu.formatWaktu(
                item[5],
                "YYYY-MM-DD HH:mm:ss",
                "DD MMMM YYYY"
              ),
            };
          }
        })
      )
      .catch((err) => {
        console.log("Ambil pesertaKuliah : " + err);
        return [];
      });
  },
  matakuliahByNomor: (conn, matakuliah) => {
    return conn
      .execute(
        "select mk.nomor, mk.matakuliah from matakuliah mk " +
          "where mk.nomor=:0 ",
        [matakuliah]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomorMk: item[0],
            namaMk: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil matakuliahByNomor : " + err);
        return [];
      });
  },
};
