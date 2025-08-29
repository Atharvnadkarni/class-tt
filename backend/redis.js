const redis = require('redis')

const redisClient = redis.createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_URI,
        port: 11131
    }
});

redisClient.on("error", (err) => console.error("Redis error:", err));

redisClient.connect().then(() => console.log('connected to redis'))

module.exports = redisClient