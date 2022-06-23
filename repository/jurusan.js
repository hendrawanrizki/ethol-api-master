module.exports = {
  getJurusan: (conn) => {
    return conn
      .execute("SELECT * FROM JURUSAN j order by j.jurusan ")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jurusan: item[1],
            kajur: item[2],
            sekjur: item[3],
            alias: item[4],
            jurusan_inggris: item[5],
            jurusan_lengkap: item[6],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  detailJurusan: (conn, nomor) => {
    return conn
      .execute("SELECT * FROM JURUSAN j WHERE j.NOMOR  =:0 ", [nomor])
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            jurusan: item[1],
            kajur: item[2],
            sekjur: item[3],
            alias: item[4],
            jurusan_inggris: item[5],
            jurusan_lengkap: item[6],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
