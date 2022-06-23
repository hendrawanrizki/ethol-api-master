module.exports = {
  simpanDosen: (
    conn,
    nomor,
    fcmToken,
    ua,
    deviceType,
    vendor,
    ipClient,
    waktu
  ) => {
    return conn
      .execute(
        "insert into fcm_token_dosen (nomor, dosen, token, ua, device_type, vendor, ip_address_client, tanggal) values (fcmtokendosen_seq.nextval, :0, :1, :2, :3, :4, :5, to_date(:6, 'YYYY-MM-DD HH24:MI:SS'))",
        [nomor, fcmToken, ua, deviceType, vendor, ipClient, waktu],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("simpan fcm token dosen", err);
        return false;
      });
  },
  updateDosen: (conn, nomorFCM, fcmToken, ua, ipClient, waktu) => {
    return conn
      .execute(
        "update fcm_token_dosen set token=:0, ua=:1, ip_address_client=:2, tanggal=to_date(:3, 'YYYY-MM-DD HH24:MI:SS') where nomor=:5",
        [fcmToken, ua, ipClient, waktu, nomorFCM],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update fcm token dosen", err);
        return false;
      });
  },
  hapusDosen: (conn, nomor) => {
    return conn
      .execute("delete from fcm_token_dosen where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete fcm_token_dosen", err);
        return false;
      });
  },
  cekDosen: (conn, nomor, deviceType, vendor) => {
    return conn
      .execute(
        "select ftd.nomor from fcm_token_dosen ftd " +
          "where ftd.dosen=:0 and ftd.device_type=:2 and ftd.vendor=:3",
        [nomor, deviceType, vendor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },

  simpanMahasiswa: (
    conn,
    nomor,
    fcmToken,
    ua,
    deviceType,
    vendor,
    ipClient,
    waktu
  ) => {
    return conn
      .execute(
        "insert into fcm_token_mahasiswa (nomor, mahasiswa, token, ua, device_type, vendor, ip_address_client, tanggal) values (fcmtokenmahasiswa_seq.nextval, :0, :1, :2, :3, :4, :5, to_date(:6, 'YYYY-MM-DD HH24:MI:SS'))",
        [nomor, fcmToken, ua, deviceType, vendor, ipClient, waktu],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("simpan fcm token mahasiswa", err);
        return false;
      });
  },
  updateMahasiswa: (conn, nomorFCM, fcmToken, ua, ipClient, waktu) => {
    return conn
      .execute(
        "update fcm_token_mahasiswa set token=:0, ua=:1, ip_address_client=:2, tanggal=to_date(:3, 'YYYY-MM-DD HH24:MI:SS') where nomor=:5",
        [fcmToken, ua, ipClient, waktu, nomorFCM],
        {
          autoCommit: true,
        }
      )
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("update fcm token mahasiswa", err);
        return false;
      });
  },
  hapusMahasiswa: (conn, nomor) => {
    return conn
      .execute("delete from fcm_token_mahasiswa where nomor=:0", [nomor], {
        autoCommit: true,
      })
      .then((res) => res.rowsAffected)
      .catch((err) => {
        console.log("delete fcm_token_mahasiswa", err);
        return false;
      });
  },
  cekMahasiswa: (conn, nomor, deviceType, vendor) => {
    return conn
      .execute(
        "select ftd.nomor from fcm_token_mahasiswa ftd " +
          "where ftd.mahasiswa=:0 and ftd.device_type=:2 and ftd.vendor=:3",
        [nomor, deviceType, vendor]
      )
      .then((res) =>
        res.rows.map((item) => {
          return {
            nomor: item[0],
          };
        })
      )
      .catch((err) => {
        console.log(err);
        return [];
      });
  },
};
