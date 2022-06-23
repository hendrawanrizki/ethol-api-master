module.exports = {
  getData: (conn, kuliah, jenis_schema) => {
    return conn
      .execute(
        "select nomor, judul, url from video where kuliah=:0 and jenis_schema=:1 order by nomor desc",
        [parseInt(kuliah), parseInt(jenis_schema)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            url: item[2],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  getDataVideoByNomor: (conn, nomorVideo) => {
    return conn
      .execute("select nomor, judul, url from video where nomor=:0", [
        nomorVideo,
      ])
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            judul: item[1],
            url: item[2],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  tambahData: async (conn, kuliah, jenis_schema, judul, url) => {
    try {
      let simpanVideo = await conn
        .execute(
          "select last_number from user_sequences where sequence_name='NVIDEO'"
        )
        .then(async (res) => {
          let idVideo = res.rows[0][0];
          let saveTugas = await conn.execute(
            "insert into video (nomor, kuliah, jenis_schema, judul, url) values (nvideo.nextval, :0, :1, :2, :3)",
            [kuliah, jenis_schema, judul, url],
            {
              autoCommit: true,
            }
          );
          return {
            sukses: true,
            nomorVideo: idVideo,
          };
        });
      return simpanVideo;
    } catch (error) {
      console.log("error simpanVideo", error);
      return {
        sukses: false,
        nomorVideo: null,
      };
    }
  },
  editData: (conn, judul, url, nomor) => {
    return conn
      .execute(
        "update video set judul=:0, url=:1 where nomor=:2",
        [judul, url, nomor],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update video", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from video where nomor=:0", [parseInt(nomor)], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete video", err);
        return false;
      });
  },
};
