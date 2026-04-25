import server from "./server";
import http from "http";

http.createServer(server).listen(4000, "0.0.0.0", () => {
  console.log("RUNNING");
});
