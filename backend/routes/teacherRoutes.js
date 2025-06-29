const express = require("express");
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require("../controllers/teacherController");

const teacherRouter = express.Router();

teacherRouter.get("/", getTeachers)
teacherRouter.get("/:id", getTeacher)
teacherRouter.post("/", createTeacher)
teacherRouter.patch("/:id", updateTeacher)
teacherRouter.delete("/:id", deleteTeacher)

module.exports = teacherRouter