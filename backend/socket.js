const { Server } = require("socket.io");
const http = require("http");

const socketListener = http.createServer(4000);
const socketServer = new Server(socketListener, {
  cors: { origin: "*" },
})
module.exports = {
    http: socketListener,
    io: socketServer
}
