const waktu = require("../helper/waktu");
module.exports = {
  getData: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select nomor, judul, isi_pengumuman, status, waktu from pengumuman where kuliah=:0 and jenis_schema=:1 order by nomor desc",
        [parseInt(kuliah), parseInt(jenis_schema)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            isi_pengumuman: item[2],
            status: item[3],
            waktu: item[4],
            waktu_indonesia: waktu.formatWaktu(
              item[4],
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
  getPengumumanTerbaru: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select nomor, judul, isi_pengumuman, status, waktu from pengumuman where kuliah=:0 and jenis_schema=:1 and waktu >= sysdate - 3 order by nomor desc",
        [parseInt(kuliah), parseInt(jenis_schema)]
      )
      .then((res) => {
        if (res.rows.length) {
          return [
            {
              nomor: res.rows[0][0],
              judul: res.rows[0][1],
              isi_pengumuman: res.rows[0][2],
              status: res.rows[0][3],
              waktu: res.rows[0][4],
              waktu_indonesia: waktu.formatWaktu(
                res.rows[0][4],
                "YYYY-MM-DD HH:mm:ss",
                "dddd, DD MMMM YYYY - HH:mm"
              ),
            },
          ];
        } else {
          return [];
        }
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  tambahData: (conn, kuliah, jenis_schema, judul, isi_pengumuman) => {
    return conn
      .execute(
        "insert into pengumuman (nomor, kuliah, jenis_schema, judul, isi_pengumuman, status, waktu) values (npengumuman_kuliah.nextval, :0, :1, :2, :3, :4, sysdate)",
        [kuliah, jenis_schema, judul, isi_pengumuman, "1"],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah pengumuman", err);
        return false;
      });
  },
  editData: (conn, judul, isi_pengumuman, nomor) => {
    return conn
      .execute(
        "update pengumuman set judul=:0, isi_pengumuman=:1 where nomor=:2",
        [judul, isi_pengumuman, nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update pengumuman", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from pengumuman where nomor=:0", [parseInt(nomor)], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete pengumuman", err);
        return false;
      });
  },
  semuaPengumuman: (conn, kuliahs) => {
    let strKuliah = "";
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
    let query = `
      select * from (
        select nomor, judul, isi, file_download, status, tanggal, 'baak' as dari, null from pengumuman_dj 
        where status=1 
        order by nomor desc
      ) where rownum <=5
      union
      select * from  (
        select p.nomor, p.judul, p.isi_pengumuman, null, p.status, p.waktu, 'kuliah', m.matakuliah from pengumuman p 
        left join kuliah k on k.nomor = p.kuliah and k.jenis_schema  = p.jenis_schema
        left join matakuliah m on m.nomor = k.matakuliah and m.jenis_schema = k.jenis_schema
        where status = '1' and p.waktu >= sysdate - 7 
        and concat(p.kuliah,p.jenis_schema) in (`;
    query += strKuliah;
    query += `)
      order by p.waktu desc
      ) where rownum <= 5 `;
    return conn
      .execute(query)
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            isi: item[2],
            file_download:
              item[3] == null || item[3] == ""
                ? null
                : process.env.BASE_URL + "/" + item[3],
            status: item[4],
            waktu: item[5],
            waktu_indonesia: waktu.formatWaktu(
              item[5],
              "YYYY-MM-DD HH:mm:ss",
              "dddd, DD MMMM YYYY - HH:mm"
            ),
            dari: item[6],
            matakuliah: item[7],
          };
        })
      )
      .catch((err) => {
        console.log("Ambil semuaPengumuman : " + err);
        return [];
      });
  },
  getDataBaak: (conn) => {
    return conn
      .execute(
        "select * from pengumuman_dj " +
          "where tanggal is not null and status='1' " +
          "order by tanggal desc "
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            isi: item[2],
            file_download:
              item[3] == null || item[3] == ""
                ? null
                : process.env.BASE_URL + "/" + item[3],
            status: item[4],
            tanggal: item[5],
            waktu_indonesia: waktu.formatWaktu(
              item[5],
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
  tambahDataBaak: (conn, judul, isi, file) => {
    return conn
      .execute(
        "insert into pengumuman_dj (nomor, judul, isi, file_download, status, tanggal) values (nmr_peng_dj.nextval, :0, :1, :2, :3, sysdate)",
        [judul, isi, file, "1"],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah pengumumanBaak", err);
        return false;
      });
  },
  updateDataBaak: (conn, nomor, judul, isi, file) => {
    return conn
      .execute(
        "update pengumuman_dj set judul=:0, isi=:1, file_download=:2 where nomor=:3",
        [judul, isi, file, nomor],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update pengumumanBaak", err);
        return false;
      });
  },
  updateDataBaakNoFile: (conn, nomor, judul, isi) => {
    return conn
      .execute(
        "update pengumuman_dj set judul=:0, isi=:1 where nomor=:2",
        [judul, isi, nomor],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update updateDataBaakNoFile", err);
        return false;
      });
  },
  hapusDataBaak: (conn, nomor) => {
    return conn
      .execute("delete from pengumuman_dj where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("hapus pengumuman_dj", err);
        return false;
      });
  },
};
