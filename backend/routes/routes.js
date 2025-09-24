const express = require("express");
const teacherRouter = require("./teacherRoutes");
const substitutionRouter = require("./subRoutes");
const timetableRouter = require("./timetableRoutes");

const router = express.Router();
router.use("/teacher", teacherRouter);
router.use("/substitution", substitutionRouter);
router.use("/timetable", timetableRouter);
module.exports = router;
