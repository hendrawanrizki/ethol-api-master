module.exports = {
  getProgram: (conn) => {
    return conn
      .execute("SELECT * FROM PROGRAM p order by program ")
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            program: item[1],
            keterangan: item[2],
            lama_studi: item[3],
            kode_epsbed: item[4],
            gelar: item[5],
            gelar_inggris: item[6],
            program_ijazah: item[7],
            program_ijazah_singkat: item[8],
            program_skpi: item[9],
            semester_maksimal: item[10],
            program_transkrip: item[11],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  detailProgram: (conn, nomor) => {
    return conn
      .execute("SELECT * FROM PROGRAM p WHERE p.NOMOR =:0 ", [nomor])
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            program: item[1],
            keterangan: item[2],
            lama_studi: item[3],
            kode_epsbed: item[4],
            gelar: item[5],
            gelar_inggris: item[6],
            program_ijazah: item[7],
            program_ijazah_singkat: item[8],
            program_skpi: item[9],
            semester_maksimal: item[10],
            program_transkrip: item[11],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
