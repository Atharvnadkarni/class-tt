const Teacher = require("../models/Teacher");
const Substitution = require("../models/Substitution");

const getSubstitutions = async (req, res) => {
  const criteria = req.query
  try {
    const substitutions = await Substitution.find(criteria).sort({ date: -1 });
    res
      .status(200)
      .json({ message: "Substitutions fetched successfully", substitutions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getSubstitution = async (req, res) => {
  const { id } = req.params;

  try {
    const substitution = await Substitution.findById(id);
    if (!substitution) {
      return res.status(404).json({ message: "Substitution not found" });
    }
    res
      .status(200)
      .json({ message: "Substitution fetched successfully", substitution });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const createSubstitution = async (req, res) => {
  const { body } = req;
  let missingFields = []
  try {
    const newSubstitution = await Substitution.create(body);
    res.status(201).json({
      message: "Substitution created successfully",
      substitution: newSubstitution,
    });
  } catch (err) {
    if (!body.class) missingFields.push("class")
    if (!body.period) missingFields.push("period")
    if (!body.date) missingFields.push("date")
    if (!body.teacher) missingFields.push("teacher")
    if (missingFields) {
      res.status(400).json({message: 'Bad request', error: `${missingFields.join(", ")} missing.`.slice(0,1).toUpperCase() + `${missingFields.join(", ")} missing.`.slice(1)})
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const updateSubstitution = async (req, res) => {
  const { body } = req;
  const { id } = req.params;

  try {
    const updatedSubstitution = await Substitution.findByIdAndUpdate(id, body, {
      new: true,
    });
    if (!updatedSubstitution) {
      return res.status(404).json({ message: "Substitution not found" });
    }
    res.status(200).json({
      message: "Substitution updated successfully",
      substitution: updatedSubstitution,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const deleteSubstitution = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSubstitution = await Substitution.findByIdAndDelete(id);
    if (!deletedSubstitution) {
      return res.status(404).json({ message: "Substitution not found" });
    }
    res.status(200).json({ message: "Substitution deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getSubstitutions,
  getSubstitution,
  createSubstitution,
  updateSubstitution,
  deleteSubstitution,
};
