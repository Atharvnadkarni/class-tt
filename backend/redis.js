require("dotenv").config();
const redis = require("redis");

const redisClient = redis.createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_URI,
    port: 11131,
  },
});

redisClient.on("error", (err) => console.error("Redis error:", err));

(async () => {
  try {
    console.log("Connecting to Redis at:", process.env.REDIS_URI);
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud!");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

module.exports = redisClient;
