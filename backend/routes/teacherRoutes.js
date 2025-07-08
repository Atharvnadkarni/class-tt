const express = require("express");
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  signupTeacher,
} = require("../controllers/teacherController");
const requireAuth = require("../middleware/requireAuth");

const teacherRouter = express.Router();

teacherRouter.post("/login", loginTeacher);
teacherRouter.post("/signup", signupTeacher);

teacherRouter.use(requireAuth);

teacherRouter.get("/", getTeachers);
teacherRouter.get("/:id", getTeacher);
teacherRouter.post("/", createTeacher);
teacherRouter.patch("/:id", updateTeacher);
teacherRouter.delete("/:id", deleteTeacher);

module.exports = teacherRouter;
