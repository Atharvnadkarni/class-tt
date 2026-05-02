const express = require("express");
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  signupTeacher,
  getTeacherWorkload,
  getTeacherIndices,
  getTeachersIndices,
} = require("../controllers/teacherController");
const requireAuth = require("../middleware/requireAuth");

const teacherRouter = express.Router();

console.log(getTeacherWorkload)
console.log(getTeacherIndices)

teacherRouter.post("/login", loginTeacher);
teacherRouter.post("/signup", signupTeacher);

teacherRouter.use(requireAuth);

teacherRouter.get("/", getTeachers);
teacherRouter.post("/", createTeacher);
teacherRouter.get("/indices/", getTeachersIndices);

teacherRouter.get("/:id", getTeacher);
teacherRouter.patch("/:id", updateTeacher);
teacherRouter.delete("/:id", deleteTeacher);
teacherRouter.get("/workload/:id", getTeacherWorkload);
teacherRouter.get("/indices/:id", getTeacherIndices);

module.exports = teacherRouter;
