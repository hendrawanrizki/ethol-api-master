const DB = require("../config/db/oracle");
const waktu = require("../helper/waktu");
const waktuDatetime = require("../helper/datetime");

module.exports = {
  validasi: (method) => {},
  tglSekarang: async (req, res) => {
    return res.json({
      tanggal: waktu.getTglSekarang(),
      tanggal_format: waktu.getTglSekarang("DD MMMM YYYY"),
      tanggal_format_dengan_hari: waktu.getTglSekarang("dddd, DD MMMM YYYY"),
      tanggal_kemerdekaan_indonesia: waktu.formatTgl(
        "1945-08-17",
        "YYYY-MM-DD",
        "dddd, DD MMMM YYYY"
      ),
      waktu_sekarang: waktu.getWaktuSekarang(),
      waktu_sekarang_format: waktu.getWaktuSekarang("DD MMMM YYYY - HH:mm:ss"),
      waktu_sekarang_dengan_hari: waktu.getWaktuSekarang(
        "dddd, DD MMMM YYYY - HH:mm:ss"
      ),
      waktu_kemerdekaan_indonesia_dengan_hari: waktu.formatWaktu(
        "1945-08-17 08:30",
        "YYYY-MM-DD HH:mm",
        "dddd, DD MMMM YYYY - HH:mm"
      ),
    });
  },
  query: async (req, res) => {
    const conn = await DB.getConnection();
    const result = await conn
      .execute(
        "select k.nomor, k.jenis_schema, mk.matakuliah, k.kode_kelas, ms.jml_mhs " +
          "from kuliah@mis k " +
          "left join matakuliah@mis mk on mk.nomor=k.matakuliah and k.jenis_schema=mk.jenis_schema " +
          "left join (select kuliah, jenis_schema, count(mahasiswa) as jml_mhs from mahasiswa_semester@mis group by kuliah, jenis_schema) ms on k.nomor=ms.kuliah and k.jenis_schema=ms.jenis_schema " +
          "where k.tahun=2020 and k.semester=2 and mk.program=3 and mk.jurusan=4 " +
          "order by k.nomor"
      )
      .then((res) => res.rows)
      .catch((err) => {
        console.log(err);
      });
    DB.closeConnection(conn);
    return res.status(200).json(result);
  },
  tes: async (req, res) => {
    return res.json({
      waktu_sekarang: waktu.getWaktuSekarang(),
      waktu_sekarang_format: waktu.getWaktuSekarang("DD MMMM YYYY - HH:mm:ss"),
      waktu_sekarang_dengan_hari: waktu.getWaktuSekarang(
        "dddd, DD MMMM YYYY - HH:mm:ss"
      ),
      currentDateTime: waktuDatetime.currentDateTime(),
    });
  },
};
