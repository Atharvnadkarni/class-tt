const Teacher = require("../models/Teacher");

const getTeachers = async (req, res) => {
  try {
    const teacher = await Teacher.find();
    res.status(200).json({ message: "Teachers fetched successfully", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher fetched successfully", teacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createTeacher = async (req, res) => {
  const { body } = req;

  try {
    const newTeacher = await Teacher.create(body);
    res
      .status(201)
      .json({ message: "Teacher created successfully", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const updateTeacher = async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  try {
    const newTeacher = await Teacher.findByIdAndUpdate(id, body, { new: true });
    if (!newTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res
      .status(200)
      .json({ message: "Teacher updated successfully", teacher: newTeacher });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
const deleteTeacher = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(id);
    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const loginTeacher = async (req, res) => {
  return res.json({ mssg: "login tr" });
};

const signupTeacher = async (req, res) => {
  const { name, subjects, username, password } = req.body;
  try {
    const teacher = await Teacher.signup(name, subjects, username, password);
    res.status(201).json({ username, teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  loginTeacher,
  signupTeacher,
};
