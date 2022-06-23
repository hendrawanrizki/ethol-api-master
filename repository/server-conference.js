module.exports = {
  getData: (conn) => {
    return conn
      .execute("select a.nomor,a.nama,a.url,(select count(b.nomor) from ROOM_MEETING b where b.server=a.NOMOR) as numroom from server_conference a order by nomor")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nama: item[1],
            url: item[2],
            numroom:item[3],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  tambahData: (conn, nama, url) => {
    return conn
      .execute(
        "insert into server_conference (nomor, nama, url) " +
          "values (nserver_conference.nextval, :0, :1)",
        [nama, url],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah server_conference", err);
        return false;
      });
  },
  editData: (conn, nomor, nama, url) => {
    return conn
      .execute(
        "update server_conference set nama=:0, url=:1 where nomor=:2",
        [nama, url, nomor],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update server_conference", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from server_conference where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("hapus server_conference", err);
        return false;
      });
  },
};
