require("dotenv").config();
const { createClient } = require("redis");
const { http, io } = require("./socket");

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URI,
    port: 11131,
  },
});
const subscriberClient = redisClient.duplicate();




redisClient.on("error", (err) => console.error("Redis error:", err));
subscriberClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  try {
    console.log("Connecting to Redis at:", process.env.REDIS_URI);
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud!");
    await subscriberClient.connect();
    console.log("✅ Connected to Sub client!");
    subscriberClient.subscribe("save_attendance", (newAttendanceRecord) => {
  io.emit("attendance", newAttendanceRecord);
});
    console.log("✅ Subscribing");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

module.exports = {redisClient};
