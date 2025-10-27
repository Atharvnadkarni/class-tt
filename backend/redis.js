require("dotenv").config();
const { createClient } = require("redis");

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

let isConnected = false;

const connectRedis = async (io) => {
  try {
    await redisClient.connect();
    await subscriberClient.connect();
    subscriberClient.subscribe("save_attendance", (newAttendanceRecord) => {
      io.emit("attendance", newAttendanceRecord);
    });
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
};

module.exports = { redisClient, connectRedis, subscriberClient };
