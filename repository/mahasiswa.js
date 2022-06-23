module.exports = {
  ambilBerdasarkanNrp: (conn, nrp) => {
    return conn
      .execute("select nomor, nrp, nama from mahasiswa where nrp=:0", [nrp])
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          nrp: res.rows[0][1],
          nama: res.rows[0][2],
        };
      })
      .catch((err) => {
        console.log("mahasiswa ambilBerdasarkanNrp : ", err);
        return [];
      });
  },
  tokenMahasiswaByKuliahId: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select ms.mahasiswa, ftm.token from mahasiswa_semester ms " +
          "left join fcm_token_mahasiswa ftm on ftm.mahasiswa = ms.mahasiswa " +
          "where ms.kuliah=:0 and  ms.jenis_schema=:1 ",
        [kuliah, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            mahasiswa: item[0],
            fcmToken: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil tokenMahasiswaByKuliahId : " + err);
        return [];
      });
  },
  tokenMahasiswaByNomor: (conn, mahasiswa) => {
    return conn
      .execute(
        "select ftm.mahasiswa, ftm.token from fcm_token_mahasiswa ftm " +
          "where ftm.mahasiswa=:0 ",
        [mahasiswa]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            mahasiswa: item[0],
            fcmToken: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil tokenMahasiswaByNomor : " + err);
        return [];
      });
  },
  tokenMahasiswaByMatakuliahId: (conn, matakuliah, dosen, tahun, semester) => {
    return conn
      .execute(
        "select ftm.mahasiswa, ftm.token from fcm_token_mahasiswa ftm " +
          "where ftm.mahasiswa  in ( " +
          "select ms.mahasiswa from mahasiswa_semester ms " +
          "where concat(ms.kuliah, ms.jenis_schema) in ( " +
          "select concat(k.nomor, k.jenis_schema) from kuliah k " +
          "where k.matakuliah=:0 and k.dosen=:1 and k.tahun=:2 and k.semester=:3 " +
          ") " +
          ") ",
        [matakuliah, dosen, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            mahasiswa: item[0],
            fcmToken: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil tokenMahasiswaByMatakuliahId : " + err);
        return [];
      });
  },
  nomorMahasiswa: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select ms.mahasiswa from mahasiswa_semester ms  " +
          "where ms.kuliah=:0 and  ms.jenis_schema=:1 ",
        [kuliah, jenis_schema]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            mahasiswa: item[0],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil nomorMahasiswa : " + err);
        return [];
      });
  },
  nomorMahasiswaByMatkul: (conn, matakuliah, dosen, tahun, semester) => {
    return conn
      .execute(
        "select ms.mahasiswa from mahasiswa_semester ms " +
          "where concat(ms.kuliah, ms.jenis_schema) in ( " +
          "select concat(k.nomor, k.jenis_schema) from kuliah k " +
          "where k.matakuliah=:0 and k.dosen=:1 and k.tahun=:2 and k.semester=:3 " +
          ") ",
        [matakuliah, dosen, tahun, semester]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            mahasiswa: item[0],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil nomorMahasiswaByMatkul : " + err);
        return [];
      });
  },
};
