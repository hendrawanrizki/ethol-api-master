module.exports = {
  getData: (conn) => {
    return conn
      .execute(
        "select rm.nomor, rm.nama, rm.umum, sc.nomor , sc.nama, sc.url " +
          "from room_meeting rm " +
          "left join server_conference sc on sc.nomor=rm.server " +
          "order by sc.nama"
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
  tambahData: (conn, nomor, nama, umum, server) => {
    return conn
      .execute(
        "insert into room_meeting (nomor, nama, umum, server) values (:0, :1, :2, :3)",
        [nomor, nama, umum, server],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah room_conference", err);
        return false;
      });
  },
  editData: (conn, nama, server, nomor, nomorAsli) => {
    return conn
      .execute(
        "update room_meeting set nama=:0, server=:1, nomor=:2 where nomor=:3",
        [nama, server, nomor, nomorAsli],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update room_conference", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from room_meeting where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete room_conference", err);
        return false;
      });
  },
  getDataUmum: (conn) => {
    return conn
      .execute(
        "select rm.nomor, rm.nama, rm.umum, sc.nomor , sc.nama, sc.url " +
          "from room_meeting rm " +
          "left join server_conference sc on sc.nomor=rm.server " +
          "where rm.umum = 1 AND rm.server is not null " +
          "order by sc.nama"
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
};
