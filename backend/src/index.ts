import dotenv from "dotenv";
dotenv.config(); // Carga las variables del .env que está en el cwd

import colors from "colors";
import server from "./server";
// import https from "https";
import http from "http";
// import fs from "fs"

const port = Number(process.env.APP_PORT) || 4000;
// const privateKeyPath = process.env.SSL_KEY_PATH;
// const certificatePath = process.env.SSL_CERT_PATH;

// server.listen(port, () => {
//   console.log(colors.bgBlue.white(`REST API funcionando en el puerto ${port}`));
//   console.log(fs.readFileSync("src/openssl/cert.pem"))
// });

const options = {
  // key: fs.readFileSync(privateKeyPath),
  // cert: fs.readFileSync(certificatePath),
};

console.log("Valor para DATABASE_URL", process.env.DATABASE_URL);
console.log("FRONTEND_URL", process.env.FRONTEND_URL);
console.log("funcionando el servidor...........");

// Define el host para que acepte conexiones externas al contenedor
const host = "0.0.0.0";

// http.createServer(options, server).listen(port, () => {
// http.createServer(options, server).listen(port, host, () => {
//   console.log(colors.bgBlue.white(`Servidor HTTPS`));
//   console.log(colors.bgBlue.white(`REST API funcionando en el puerto ${port}`));
//   console.log("FRONTEND_URL", process.env.FRONTEND_URL);
// });

http.createServer(server).listen(port, host, () => {
  console.log(colors.bgBlue.white(`Servidor HTTPS`));
  console.log(colors.bgBlue.white(`REST API funcionando en el puerto ${port}`));
  console.log("FRONTEND_URL", process.env.FRONTEND_URL);
});
