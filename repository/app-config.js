module.exports = {
  ambilConfig: (conn) => {
    return conn
      .execute("select * from app_config ac where ac.id='CONF01'")
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            nama_aplikasi: item[1],
            akronim_nama_aplikasi: item[2],
            tahun_aktif: item[3],
            semester_aktif: item[4],
            tahun_ajaran_aktif: item[5],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua : ", err);
        return [];
      });
  },
};
