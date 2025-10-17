const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/routes");
const cors = require("cors");
const createSocketFromApp = require("./socket");
const { connectRedis, subscriberClient } = require("./redis");
const { initSocket } = require("./utils/socketManager");

require("dotenv").config();

const app = express();
const { server, io } = createSocketFromApp(app);
initSocket(io);

(async () => await connectRedis(io))();

app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url, req.body);
  next();
});
app.use(cors());
app.use("/api", router);

mongoose.connect(process.env.MONGO_CONNECTION_URI).then((res) => {
  server.listen(process.env.PORT || 4000, () => {
    console.log("App server listening");
  });
});
