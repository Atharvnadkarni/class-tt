const express = require("express");
const teacherRouter = require("./teacherRoutes");
const substitutionRouter = require("./subRoutes");
const timetableRouter = require("./timetableRoutes");
const attendanceRouter = require("./attendanceRoutes");

const router = express.Router();
router.use("/teacher", teacherRouter);
router.use("/substitution", substitutionRouter);
router.use("/timetable", timetableRouter);
router.use("/attendance", attendanceRouter);
module.exports = router;
