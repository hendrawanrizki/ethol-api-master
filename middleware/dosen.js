const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.headers.token;
  try {
    if (!token) {
      return res.status(200).json({
        sukses: false,
        pesan: "Anda belum melakukan Login",
      });
    } else {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      if (req.user.hakAkses.includes("dosen")) {
        next();
      } else {
        return res.status(401).json({
          sukses: false,
          pesan: "User tidak diijinkan",
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(200).json({
      sukses: false,
      pesan: "Token tidak valid, Harap login terlebih dahulu",
    });
  }
};
