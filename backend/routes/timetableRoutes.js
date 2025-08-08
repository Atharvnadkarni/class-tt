const express = require("express");
const {
  getTimetable, saveTimetable
} = require("../controllers/timetableController");

const timetableRouter = express.Router();

timetableRouter.get("/", getTimetable)
timetableRouter.patch("/", saveTimetable)

module.exports = timetableRouter;
