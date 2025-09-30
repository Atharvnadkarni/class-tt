const { Server } = require("socket.io");
const http = require("http");
const redisClient = require("./redis");

const socketListener = http.createServer(4000);
const socketServer = new Server(socketListener, {
  cors: { origin: "*" },
});
socketServer.on("connection", (client) => {
  console.log("User connected", client.id);
  client.on("save_attendance", async (record) => {
    await redisClient.publish("save_attendance", record)
  });
  client.on("disconnect", () => {
    console.log("User disconnected:", client.id);
  });
});
module.exports = {
  http: socketListener,
  io: socketServer,
};
