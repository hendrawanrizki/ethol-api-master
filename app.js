const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const http = require("http");
const routes = require("./route");
const requestIp = require("request-ip");

/**
 * Config untuk menginisiasi variabel pada file .env
 */
dotenv.config();

/*
 * Inisialisasi App instance
 */
const app = express();
const port = normalizePort(process.env.PORT);
app.set("port", port);

global.__basedir = __dirname;

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
/*
 * Konfigurasi CORS allow origin
 */
app.use(cors());

/*
 * Konfigurasi get IP Client
 */
app.use(requestIp.mw());
/*
 * Konfigurasi dasar yang digunakan dalam project
 * JSON parameter, penempatan static file seperti gambar dan sebagainya
 */
app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(
  bodyParser.json({
    limit: "15mb",
  })
);
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(cookieParser());
app.use(logger("dev"));
app.use(express.static(__dirname + "/public"));

/*
 * register route
 */
app.use(routes);
/*
 * Error Handling untuk bad request
 */
app.use((req, res, next) => {
  res.status(404);
  res.send({
    code: 404,
    message: "Not Found",
  });
});

/*
 * Konfigurasi mode (Development dan Production)
 */
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      // eslint-disable-next-line
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      // eslint-disable-next-line
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  console.log("Listening on " + bind);
}
