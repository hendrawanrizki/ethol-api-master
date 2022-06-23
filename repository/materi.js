const waktu = require("../helper/waktu");
module.exports = {
  ambilSemua: (conn, dosen, matakuliah) => {
    return conn
      .execute(
        "select nomor, title, deskripsi, path, tanggal " +
          "from materi_kuliah " +
          "where kuliah=:0 and dosen=:1 order by nomor desc",
        [matakuliah, dosen]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            title: item[1],
            description: item[2],
            path: process.env.BASE_URL + "/" + item[3],
            created: item[4],
            created_indonesia: waktu.formatWaktu(
              item[4],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua materi : ", err);
        return [];
      });
  },
  ambilByNomor: (conn, materi) => {
    return conn
      .execute(
        "select nomor, title, deskripsi, path, tanggal " +
          "from materi_kuliah " +
          "where nomor=:0",
        [materi]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            title: item[1],
            description: item[2],
            path: process.env.BASE_URL + "/" + item[3],
            created: item[4],
            created_indonesia: waktu.formatWaktu(
              item[4],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilByNomor materi : ", err);
        return [];
      });
  },
  findById: (conn, id) => {
    return conn
      .execute(
        "select nomor, title, deskripsi, path, tanggal " +
          "from materi_kuliah " +
          "where nomor=:0",
        [id]
      )
      .then((result) => {
        return {
          id: result.rows[0][0],
          title: result.rows[0][1],
          description: result.rows[0][2],
          path: process.env.BASE_URL + "/" + result.rows[0][3],
          created: result.rows[0][4],
        };
      })
      .catch((err) => {
        console.log("findById : ", err);
        return [];
      });
  },
  findByIdComplete: (conn, id) => {
    return conn
      .execute(
        "select mk.nomor, mk.title, mk.deskripsi, mk.path, mk.tanggal, p.nama, m.matakuliah from materi_kuliah mk " +
          "join pegawai p on p.nomor = mk.dosen " +
          "join matakuliah m on m.nomor = mk.kuliah " +
          "where mk.nomor=:0 and rownum = 1 ",
        [id]
      )
      .then((result) => {
        return {
          success: true,
          id: result.rows[0][0],
          title: result.rows[0][1],
          description: result.rows[0][2],
          path: process.env.BASE_URL + "/" + result.rows[0][3],
          created: result.rows[0][4],
          created_indonesia: waktu.formatWaktu(
            result.rows[0][4],
            "YYYY-MM-DD HH:mm:ss",
            "dddd, DD MMMM YYYY - HH:mm"
          ),
          dosen: result.rows[0][5],
          matakuliah: result.rows[0][6],
        };
      })
      .catch((err) => {
        console.log("findByIdComplete : ", err);
        return {
          success: false,
          title: "Tidak Ditemukan",
        };
      });
  },
  hapusData: (conn, id) => {
    return conn
      .execute("delete from materi_kuliah where nomor=:0", [id], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete materi", err);
        return false;
      });
  },
  simpan: async (conn, idKuliah, judul, nomorDosen, savePath) => {
    try {
      let simpanMateri = await conn
        .execute(
          "select last_number from user_sequences where sequence_name='UPLOADMATERI_SEQ'"
        )
        .then(async (res) => {
          let idMateri = res.rows[0][0];
          let saveTugas = await conn.execute(
            "insert into materi_kuliah (nomor, kuliah, title, status, dosen ,path, tanggal) values (uploadmateri_seq.nextval, :0, :1, :2, :3, :4, sysdate)",
            [idKuliah, judul, 1, nomorDosen, savePath],
            {
              autoCommit: true,
            }
          );
          return {
            sukses: true,
            nomorMateri: idMateri,
          };
        });
      return simpanMateri;
    } catch (error) {
      console.log("error simpanMateri", error);
      return {
        sukses: false,
        nomorMateri: null,
      };
    }
  },
  findRelated: async (conn, matkulId, dosenId) => {
    const material = [];
    const course = await conn.execute(
      "select matakuliah from matakuliah where nomor=:0",
      [matkulId]
    );
    if (!course) {
      return [];
    }
    const temp = course.rows[0][0].split("-Ku:");
    const courseName = temp[0];
    const result = await conn.execute(
      "select mk.nomor, mk.title, mk.deskripsi, mk.path, mk.tanggal, mk.kuliah, mk.dosen from materi_kuliah mk join matakuliah m on mk.kuliah=m.nomor where mk.dosen=" +
        dosenId +
        " and m.matakuliah like '" +
        courseName +
        "%' order by mk.nomor desc"
    );
    result.rows.forEach((item) => {
      material.push({
        id: item[0],
        selected: false,
        title: item[1],
        description: item[2],
        path: item[3],
        created: item[4],
        idMatakuliah: item[5],
        dosen: item[6],
      });
    });
    return material;
  },
  materiProgramJurusan: async (conn, program, jurusan) => {
    return conn
      .execute(
        "select m.title, m.path, mk.matakuliah, m.tanggal from materi_kuliah m left join matakuliah mk on m.kuliah=mk.nomor where mk.program=:0 and mk.jurusan=:1 and mk.tahun >= 2019 order by mk.nomor, m.nomor",
        [program, jurusan]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            judul: item[0],
            matakuliah: item[2],
            path: process.env.BASE_URL + "/" + item[1],
            created_indonesia: waktu.formatWaktu(
              item[3],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua materi : ", err);
        return [];
      });
  },
};
