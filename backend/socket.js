const { Server } = require("socket.io");
const http = require("http");
const {redisClient, subscriberClient} = require("./redis");
const createSocketFromApp = (app) => {
  const socketListener = http.createServer(app);
  const socketServer = new Server(socketListener, {
    cors: { origin: "*" },
  });
  socketServer.on("connection", (client) => {
    console.log("User connected", client.id);
    client.on("save_attendance", async (record) => {
      console.log("Save Attendance received")
      await redisClient.publish("save_attendance", record);
    });
    client.on("disconnect", () => {
      console.log("User disconnected:", client.id);
    });
  });
  return { server: socketListener, io: socketServer };
};
module.exports = createSocketFromApp