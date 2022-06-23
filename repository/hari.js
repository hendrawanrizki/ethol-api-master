module.exports = {
  ambilSemua: (conn) => {
    return conn
      .execute("select nomor, hari from hari order by nomor")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            hari: item[1],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua hari : ", err);
        return [];
      });
  },
};
