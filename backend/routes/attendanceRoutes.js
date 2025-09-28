const express = require("express");
const {
  getAttendance,
  saveAttendance,
} = require("../controllers/attendanceController");

const attendanceRouter = express.Router();

attendanceRouter.get("/", getAttendance);
attendanceRouter.patch("/", saveAttendance);

module.exports = attendanceRouter;
