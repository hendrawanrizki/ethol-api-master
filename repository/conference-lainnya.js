module.exports = {
  getData: (conn, dosen) => {
    return conn
      .execute("select nomor, url from conference where dosen=:0 ", [dosen])
      .then((res) => {
        if (res.rows.length) {
          return {
            nomor: res.rows[0][0],
            url: res.rows[0][1],
          };
        } else {
          return {
            nomor: null,
            url: null,
          };
        }
      })
      .catch((err) => {
        console.log(err);
        return {
          nomor: null,
          url: null,
        };
      });
  },
  detail: (conn, nomor) => {
    return conn
      .execute(
        "select rm.nomor, rm.nama, rm.umum, sc.nomor , sc.nama, sc.url " +
          "from room_meeting rm " +
          "left join server_conference sc on sc.nomor=rm.server " +
          "where rm.nomor=:0 " +
          "order by sc.nama",
        [nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nama: item[1],
            umum: item[2],
            server: {
              nomor: item[3],
              nama: item[4],
              url: item[5],
            },
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  tambahData: (conn, url, dosen) => {
    return conn
      .execute(
        "insert into conference (nomor, dosen, url) values (nconference.nextval, :0, :1)",
        [dosen, url],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah conferenceLainya", err);
        return false;
      });
  },
  editData: (conn, url, nomor) => {
    return conn
      .execute("update conference set url=:1 where nomor=:2", [url, nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update conferenceLainya", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from conference where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete room_conference", err);
        return false;
      });
  },
};
