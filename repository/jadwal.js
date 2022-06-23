module.exports = {
  getJadwal: (conn, tahun, semester) => {
    return conn
      .execute(
        "select distinct  k.nomor as nomor_k, k.dosen, k.tahun, k.semester, mk.matakuliah, " +
          "k.ruang ruang_1, rk.ruang nama_ruang_1, k.hari hari_1, h.hari nama_hari_1, j.jam jam_1, " +
          "k.ruang_2, rk2.ruang nama_ruang_2, k.hari_2, h2.hari nama_hari_2, j2.jam as jam_2, k.jenis_schema, " +
          "coalesce(mk.jam,0) as jam_kali_50, k.kuliah_gabungan " +
          "from kuliah k " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "left join hari h on h.nomor = k.hari " +
          "left join hari h2 on h2.nomor = k.hari_2 " +
          "left join ruang_kuliah rk on rk.nomor = k.ruang " +
          "left join ruang_kuliah rk2 on rk2.nomor = k.ruang_2 " +
          "left join jam j on k.jam=j.nomor and j.jenis_schema = k.jenis_schema " +
          "left join jam j2 on k.jam_2=j2.nomor and j2.jenis_schema = k.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and k.hari is not null ",
        [tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor_k: item[0],
            dosen: item[1],
            tahun: item[2],
            semester: item[3],
            matakuliah: item[4],
            ruang_1: item[5],
            nama_ruang_1: item[6],
            hari_1: item[7],
            nama_hari_1: item[8],
            jam_1: item[9],
            ruang_2: item[10],
            nama_ruang_2: item[11],
            hari_2: item[12],
            nama_hari_2: item[13],
            jam_2: item[14],
            jenis_schema: item[15],
            jam_kali_50: item[16],
            kuliah_gabungan: item[17],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  saveJadwal: (conn, dataJadwal, index) => {
    return conn
      .execute(
        "insert into kuliah_dosen_jaga (nomor, kuliah, pegawai, hari, jam_awal, jam_akhir, jenis_schema, room_meeting_id, tahun, semester, kuliah_gabungan) values (nkuliah_dosen_jaga.nextval, :0, :1, :2, :3, :4, :1, :6, :7, :8, :9)",
        [
          dataJadwal.nomor_k,
          dataJadwal.dosen,
          dataJadwal.convertHari,
          dataJadwal.convertJamAwal,
          dataJadwal.convertJamAkhir,
          dataJadwal.jenis_schema,
          dataJadwal.convertRuang,
          dataJadwal.tahun,
          dataJadwal.semester,
          dataJadwal.kuliah_gabungan,
        ],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("insert kuliah_dosen_jaga " + index, err);
        return false;
      });
  },
  getKuliahDosenJaga: (conn, tahun, semester, jurusan, program) => {
    return conn
      .execute(
        "select kk.kuliah, kk.pegawai, p.gelar_dpn, p.nama, p.gelar_blk,  k.kode_kelas, k.pararel, m.nomor nomor_mk, m.matakuliah from " +
          "(select distinct kdj.kuliah, kdj.pegawai, kdj.semester, kdj.tahun, kdj.jenis_schema from kuliah_dosen_jaga kdj) kk " +
          "join ( " +
          "select kul.nomor, kul.jenis_schema, kul.pararel, kul.kode_kelas, kul.tahun, kul.semester, kul.matakuliah from kuliah kul " +
          ") k on k.nomor = kk.kuliah and k.jenis_schema = kk.jenis_schema and k.tahun = kk.tahun and k.semester = kk.semester " +
          "left join matakuliah m on m.nomor = k.matakuliah and m.jenis_schema  = k.jenis_schema " +
          "left join pegawai p on p.nomor  = kk.pegawai " +
          "where kk.tahun =:0 and kk.semester =:1 and m.jurusan =:2 and m.program =:3 ",
        [tahun, semester, jurusan, program]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            kuliah: item[0],
            pegawai: item[1],
            gelar_dpn: item[2],
            nama_dosen: item[3],
            gelar_blk: item[4],
            kode_kelas: item[5],
            pararel: item[6],
            nomor_mk: item[7],
            matakuliah: item[8],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getWaktuKuliahDosenJaga: (conn, tahun, semester, jurusan, program) => {
    return conn
      .execute(
        "select kdj.*, h.hari nama_hari, rk.ruang, rk.keterangan ket_ruang from kuliah_dosen_jaga kdj " +
          "join ( " +
          "select kul.nomor, kul.jenis_schema, kul.pararel, kul.kode_kelas, kul.tahun, kul.semester, kul.matakuliah from kuliah kul " +
          ") k on k.nomor = kdj.kuliah and k.jenis_schema = kdj.jenis_schema and k.tahun = kdj.tahun and k.semester = kdj.semester " +
          "left join matakuliah m on m.nomor = k.matakuliah and m.jenis_schema  = k.jenis_schema " +
          "left join hari h on h.nomor  = kdj.hari " +
          "left join ruang_kuliah rk on rk.nomor  = kdj.room_meeting_id " +
          "where kdj.tahun =:0 and kdj.semester =:1 and m.jurusan =:2 and m.program =:3 ",
        [tahun, semester, jurusan, program]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            kuliah: item[1],
            pegawai: item[2],
            hari: item[3],
            jam_awal: item[4],
            jam_akhir: item[5],
            room_meeting_id: item[6],
            jenis_schema: item[7],
            tahun: item[8],
            semester: item[9],
            nama_hari: item[11],
            ruang: item[12],
            ket_ruang: item[13],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  hapusJadwal: (conn, tahun, semester) => {
    return conn
      .execute(
        "delete from kuliah_dosen_jaga where tahun=:0 and semester=:1",
        [tahun, semester],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete hapusJadwal", err);
        return false;
      });
  },
  dosen: (conn, nomorDosen, tahun, semester) => {
    return conn
      .execute(
        "select k.nomor, m.matakuliah, h.hari, kdj.jam_awal, kdj.jam_akhir, k.pararel, rm.nama, k.kode_kelas, k.jenis_schema, h.nomor nomor_hari, k.kuliah_gabungan from matakuliah m " +
          "left join kuliah k  on m.nomor=k.matakuliah and m.jenis_schema=k.jenis_schema " +
          "left join kuliah_dosen_jaga kdj on k.nomor=kdj.kuliah and k.jenis_schema=kdj.jenis_schema " +
          "left join hari h on kdj.hari=h.nomor " +
          "left join room_meeting rm on kdj.room_meeting_id=rm.nomor " +
          "where k.tahun=:0 and k.semester=:1 and k.dosen=:2 " +
          "order by kdj.jam_awal asc ",
        [tahun, semester, nomorDosen]
      )
      .then((res) =>
        res.rows.map((item) => {
          let isKuliahGabung = false;
          if (item[8] == 1 || item[8] == 4) {
            // jika kelas reguler(1) atau kurikulum MBKM(4) ada kuliah gabungan
            if (item[10] != null && item[10] != "") {
              // jika kuliah gabung tidak null dan tidak kosong
              isKuliahGabung = true;
            }
          }
          return {
            matakuliah: item[1],
            hari: item[2],
            jam_awal: item[3],
            jam_akhir: item[4],
            pararel: item[5],
            ruang: item[6],
            kode_kelas: item[7],
            jenis_schema: item[8],
            nomor_hari: item[9],
            isKuliahGabungan: isKuliahGabung,
            kuliahGabungan: isKuliahGabung == true ? item[10] : null,
          };
        })
      )
      .catch((err) => {
        console.log("Ambil jadwal online dosen : " + err);
        return [];
      });
  },
  mahasiswa: (conn, nomorMahasiswa, tahun, semester) => {
    return conn
      .execute(
        "select k.nomor, m.matakuliah, h.hari, kdj.jam_awal, kdj.jam_akhir, p.nama, rm.nama, k.kode_kelas, p.gelar_dpn, p.gelar_blk, h.nomor from matakuliah m " +
          "left join kuliah k on m.nomor=k.matakuliah and m.jenis_schema=k.jenis_schema " +
          "left join pegawai p on k.dosen=p.nomor " +
          "left join mahasiswa_semester ms on k.nomor=ms.kuliah " +
          "left join kuliah_dosen_jaga kdj on k.nomor=kdj.kuliah and k.jenis_schema=kdj.jenis_schema " +
          "left join hari h on kdj.hari=h.nomor " +
          "left join room_meeting rm on kdj.room_meeting_id=rm.nomor " +
          "where k.tahun=:0 and k.semester=:1 and ms.mahasiswa=:2 " +
          "order by kdj.jam_awal asc ",
        [tahun, semester, nomorMahasiswa]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            matakuliah: item[1],
            hari: item[2],
            jam_awal: item[3],
            jam_akhir: item[4],
            dosen: item[5],
            ruang: item[6],
            kode_kelas: item[7],
            gelar_dpn: item[8],
            gelar_blk: item[9],
            nomor_hari: item[10],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil jadwal online mahasiswa : " + err);
        return [];
      });
  },
  getCariKuliah: (conn, tahun, semester) => {
    return conn
      .execute(
        "select distinct  k.nomor as nomor_k, k.dosen, k.tahun, k.semester, mk.matakuliah, " +
          "k.ruang ruang_1, rk.ruang nama_ruang_1, k.hari hari_1, h.hari nama_hari_1, j.jam jam_1, " +
          "k.ruang_2, rk2.ruang nama_ruang_2, k.hari_2, h2.hari nama_hari_2, j2.jam as jam_2, k.jenis_schema, " +
          "coalesce(mk.jam,0) as jam_kali_50, k.kuliah_gabungan, p.nama, p.gelar_dpn, p.gelar_blk, k.kode_kelas, k.pararel " +
          "from kuliah k " +
          "left join matakuliah mk on k.matakuliah=mk.nomor and k.jenis_schema=mk.jenis_schema " +
          "left join pegawai p on p.nomor=k.dosen " +
          "left join hari h on h.nomor = k.hari " +
          "left join hari h2 on h2.nomor = k.hari_2 " +
          "left join ruang_kuliah rk on rk.nomor = k.ruang " +
          "left join ruang_kuliah rk2 on rk2.nomor = k.ruang_2 " +
          "left join jam j on k.jam=j.nomor and j.jenis_schema = k.jenis_schema " +
          "left join jam j2 on k.jam_2=j2.nomor and j2.jenis_schema = k.jenis_schema " +
          "where k.tahun=:0 and k.semester=:1 and k.hari is not null ",
        [tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor_k: item[0],
            dosen: item[1],
            tahun: item[2],
            semester: item[3],
            matakuliah: item[4],
            ruang_1: item[5],
            nama_ruang_1: item[6],
            hari_1: item[7],
            nama_hari_1: item[8],
            jam_1: item[9],
            ruang_2: item[10],
            nama_ruang_2: item[11],
            hari_2: item[12],
            nama_hari_2: item[13],
            jam_2: item[14],
            jenis_schema: item[15],
            jam_kali_50: item[16],
            kuliah_gabungan: item[17],
            nama_dosen: item[18],
            gelar_dpn: item[19],
            gelar_blk: item[20],
            kode_kelas: item[21],
            pararel: item[22],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
