const waktu = require("../helper/waktu");
module.exports = {
  ambilSemua: (conn) => {
    const year = new Date().getFullYear();
    return conn
      .execute(
        "select nomor, to_char(tanggal, 'YYYY-MM-DD') from tgl_libur where extract(YEAR from tanggal)=:0 order by tanggal",
        [year]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            tanggal: item[1],
            tanggal_indonesia: waktu.formatTgl(
              item[1],
              "YYYY-MM-DD",
              "dddd, DD MMMM YYYY"
            ),
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua libur di tahun ini : ", err);
        return [];
      });
  },
  tambahData: (conn, tanggal) => {
    return conn
      .execute(
        "insert into tgl_libur (nomor, tanggal) " +
          "values (ntgl_libur.nextval, to_date(:0, 'YYYY-MM-DD'))",
        [tanggal],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("tambah tanggal libur", err);
        return false;
      });
  },
  hapusData: (conn, nomor) => {
    return conn
      .execute("delete from tgl_libur where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("hapus tanggal libur", err);
        return false;
      });
  },
};
