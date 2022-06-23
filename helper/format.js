module.exports = {
  formatNamaPegawai: (gelarDepan, nama, gelarBelakang) => {
    let hasil = "";
    if (gelarDepan) {
      hasil += `${gelarDepan} `;
    }
    hasil += nama;
    if (gelarBelakang) {
      hasil += ` ${gelarBelakang}`;
    }
    return hasil;
  },
};
