const express = require("express");
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, loginTeacher, signupTeacher } = require("../controllers/teacherController");

const teacherRouter = express.Router();

teacherRouter.get("/", getTeachers)
teacherRouter.get("/:id", getTeacher)
teacherRouter.post("/", createTeacher)
teacherRouter.patch("/:id", updateTeacher)
teacherRouter.delete("/:id", deleteTeacher)

teacherRouter.post("/login", loginTeacher)
teacherRouter.post("/signup", signupTeacher)


module.exports = teacherRouter