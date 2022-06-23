module.exports = {
  mahasiswa: (conn, nomor) => {
    return conn
      .execute(
        "select m.nomor, m.nrp, m.nama, k.kode, p.program, j.jurusan, f.image from mahasiswa m left join kelas k on m.kelas=k.nomor left join program p on k.program=p.nomor left join jurusan j on k.jurusan=j.nomor left join foto_profile f on m.nomor=f.mahasiswa where m.nrp=:0",
        [parseInt(nomor)]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            nrp: item[1],
            name: item[2],
            kelas: item[3],
            program: item[4],
            jurusan: item[5],
            image: item[6]
              ? process.env.BASE_URL +
                process.env.IMAGE_FOLDER +
                result.rows[0][6]
              : process.env.BASE_URL + process.env.IMAGE_FOLDER + "user.png",
            role: "mahasiswa",
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
  dosen: (conn, nomor) => {
    return conn
      .execute(
        "select p.nomor, p.nip, p.nama, j.jurusan, f.image from pegawai p left join jurusan j on p.jurusan=j.nomor left join foto_profile f on p.nomor=f.dosen where p.nip=:0",
        [nomor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            id: item[0],
            nip: item[1],
            name: item[2],
            jurusan: item[3],
            image: item[6]
              ? process.env.BASE_URL +
                process.env.IMAGE_FOLDER +
                result.rows[0][4]
              : process.env.BASE_URL + process.env.IMAGE_FOLDER + "user.png",
            role: "dosen",
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
