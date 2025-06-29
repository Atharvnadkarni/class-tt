const express = require("express");
const mongoose = require("mongoose");
const router = require("./routes/routes");
const cors = require("cors");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url, req.body);
  next();
});
app.use(cors());
app.use("/api", router);

mongoose.connect(process.env.MONGO_CONNECTION_URI).then((res) =>
  app.listen(process.env.PORT || 4000, () => {
    console.log("Connected to mongoose");
  })
);
