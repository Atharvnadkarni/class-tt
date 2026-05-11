const express = require("express");
const {
  getTimetable, saveTimetable,
  generateTimeTable
} = require("../controllers/timetableController");

const timetableRouter = express.Router();

timetableRouter.get("/", getTimetable)
timetableRouter.post("/generate", generateTimeTable)
timetableRouter.patch("/", saveTimetable)

module.exports = timetableRouter;
