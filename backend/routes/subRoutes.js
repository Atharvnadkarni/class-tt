const express = require("express");
const { getSubstitutions, getSubstitution, createSubstitution, updateSubstitution, deleteSubstitution } = require("../controllers/subController");

const substitutionRouter = express.Router();

substitutionRouter.get("/", getSubstitutions)
substitutionRouter.get("/:id", getSubstitution)
substitutionRouter.post("/", createSubstitution)
substitutionRouter.patch("/:id", updateSubstitution)
substitutionRouter.delete("/:id", deleteSubstitution)

module.exports = substitutionRouter