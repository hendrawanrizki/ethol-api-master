module.exports = {
  getData: (conn, userId, tipe) => {
    return conn
      .execute(
        "select count(*) jml from survei_penilaian where user_id=:0 and tipe=:1",
        [parseInt(userId), parseInt(tipe)]
      )
      .then((res) => {
        return {
          jumlah: res.rows[0][0],
        };
      })
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  simpanData: (
    conn,
    nomor,
    tipe,
    fiturAbsensi,
    fiturTugas,
    fiturConference,
    fiturMateri,
    fiturVideo,
    tipeConference,
    ratingKepuasan,
    saranMasukan
  ) => {
    return conn
      .execute(
        "insert into survei_penilaian (id, user_id, tipe, fitur_absensi, fitur_tugas, fitur_conference, fitur_materi, fitur_video, conference, rating_kepuasan, saran_masukan, waktu_insert) values (nsurvei_penilaian.nextval, :0, :1, :2, :3, :4, :5, :6, :7, :8, :9, sysdate)",
        [
          nomor,
          tipe,
          fiturAbsensi,
          fiturTugas,
          fiturConference,
          fiturMateri,
          fiturVideo,
          tipeConference,
          ratingKepuasan,
          saranMasukan,
        ],
        { autoCommit: true }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("simpan survei", err);
        return false;
      });
  },
};
