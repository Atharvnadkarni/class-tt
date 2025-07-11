const Teacher = require("../models/Teacher");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

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
  const hashedPassword = await bcrypt.hash(body.password, 10);
  try {
    const newTeacher = await Teacher.create(
      Object.assign({}, body, { password: hashedPassword })
    );
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
  const hashedPassword = await bcrypt.hash(body.password, 10);

  try {
    const newTeacher = await Teacher.findByIdAndUpdate(
      id,
      Object.assign({}, body, { password: hashedPassword }),
      { new: true }
    );
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
  const { username, password } = req.body;
  try {
    const teacher = await Teacher.login(username, password);

    // create token
    const token = createToken(teacher._id);
    res.status(200).json({ username, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const signupTeacher = async (req, res) => {
  const { name, subjects, username, password } = req.body;
  try {
    const teacher = await Teacher.signup(name, subjects, username, password);

    // create token
    const token = createToken(teacher._id);
    res.status(201).json({ username, token });
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
