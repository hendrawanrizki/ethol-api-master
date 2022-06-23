const DB = require("../config/db/oracle");
const path = require("path");
const fs = require("fs");

module.exports = {
  validasi: (method) => {
    switch (method) {
      case "test":
        return [query("dosen").notEmpty()];
    }
  },
  test: async (req, res) => {
    let response = {
      dbConnection: false,
      storage: false,
    };
    // cek db connection
    const conn = await DB.getConnection();
    if (conn) {
      response.dbConnection = true;
      DB.closeConnection(conn);
    } else {
      response.dbConnection = false;
    }

    // cek storage
    if (fs.existsSync(path.join(__dirname, "../public/upload"))) {
      response.storage = true;
    } else {
      response.storage = false;
    }

    return res.send(response.dbConnection && response.storage ? "OK" : "Error");
  },
};
