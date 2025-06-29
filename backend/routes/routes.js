const express = require("express");
const teacherRouter = require("./teacherRoutes");
const substitutionRouter = require("./subRoutes");
// const classRouter = require("./classRoutes");

const router = express.Router();
router.use('/teacher', teacherRouter)
router.use('/substitution', substitutionRouter)
// router.use('/class', classRouter)
module.exports = router