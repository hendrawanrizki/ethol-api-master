module.exports = {
  admin: (user) => {
    return user.hakAkses.includes("admin");
  },
  baak: (user) => {
    return user.hakAkses.includes("baak");
  },
  dosen: (user) => {
    return user.hakAkses.includes("dosen");
  },
  kaprodi: (user) => {
    return user.hakAkses.includes("kaprodi");
  },
  mahasiswa: (user) => {
    return user.hakAkses.includes("mahasiswa");
  },
};
