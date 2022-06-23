module.exports = {
  ambilBerdasarkanNip: (conn, nip) => {
    return conn
      .execute(
        "select nomor, nip, nama, staff, gelar_dpn, gelar_blk from pegawai where nip=:0",
        [nip]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          nip: res.rows[0][1],
          nama: res.rows[0][2],
          staff: res.rows[0][3],
          gelarDpn: res.rows[0][4],
          gelarBlk: res.rows[0][5],
        };
      })
      .catch((err) => {
        console.log("pegawai ambilBerdasarkanNip : ", err);
        return null;
      });
  },
  ambilBerdasarkanNomor: (conn, nomor) => {
    return conn
      .execute(
        "select nomor, nip, nama, staff, gelar_dpn, gelar_blk from pegawai where nomor=:0",
        [nomor]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          nip: res.rows[0][1],
          nama: res.rows[0][2],
          staff: res.rows[0][3],
          gelarDpn: res.rows[0][4],
          gelarBlk: res.rows[0][5],
        };
      })
      .catch((err) => {
        console.log("pegawai ambilBerdasarkanNomor : ", err);
        return null;
      });
  },
  ambilBerdasarkanUsername: (conn, username) => {
    return conn
      .execute(
        "select nomor, nip, nama, staff, gelar_dpn, gelar_blk, password from pegawai where upper(username)=upper(:0)",
        [username]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          nip: res.rows[0][1],
          nama: res.rows[0][2],
          staff: res.rows[0][3],
          gelarDpn: res.rows[0][4],
          gelarBlk: res.rows[0][5],
          password: res.rows[0][6],
        };
      })
      .catch((err) => {
        console.log("pegawai ambilBerdasarkanNomor : ", err);
        return null;
      });
  },
  ambilBerdasarkanUsernamePassword: (conn, username, password) => {
    return conn
      .execute(
        "select nomor, nip, nama, staff, gelar_dpn, gelar_blk, password from pegawai where upper(username)=upper(:0) and password=:1",
        [username, password]
      )
      .then((res) => {
        return {
          nomor: res.rows[0][0],
          nip: res.rows[0][1],
          nama: res.rows[0][2],
          staff: res.rows[0][3],
          gelarDpn: res.rows[0][4],
          gelarBlk: res.rows[0][5],
          password: res.rows[0][6],
        };
      })
      .catch((err) => {
        console.log("pegawai ambilBerdasarkanUsernamePassword : ", err);
        return null;
      });
  },
  kaprodi: (conn, nomor) => {
    return conn
      .execute("select count(nomor) from program_studi where kepala=:0", [
        nomor,
      ])
      .then((res) => res.rows.length > 0)
      .catch((err) => {
        console.log(err);
        return false;
      });
  },
  dosen: (conn) => {
    return conn
      .execute(
        "select p.nomor, p.nip, p.nama, p.gelar_dpn, p.gelar_blk from pegawai p " +
          "where p.staff in (4, 57, 59)"
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
            nip: item[1],
            nama: item[2],
            gelarDpn: item[3],
            gelarBlk: item[4],
          };
        })
      )
      .catch((err) => {
        console.log("ambilSemua dosen : ", err);
        return [];
      });
  },
};
