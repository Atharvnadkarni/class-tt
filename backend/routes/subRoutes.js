const express = require("express");
const {
  getSubstitutions,
  getSubstitution,
  createSubstitution,
  updateSubstitution,
  deleteSubstitution,
} = require("../controllers/subController");
const requireAuth = require('../middleware/requireAuth')

const substitutionRouter = express.Router();

substitutionRouter.use(requireAuth);

substitutionRouter.get("/", getSubstitutions);
substitutionRouter.get("/:id", getSubstitution);
substitutionRouter.post("/", createSubstitution);
substitutionRouter.patch("/:id", updateSubstitution);
substitutionRouter.delete("/:id", deleteSubstitution);

module.exports = substitutionRouter;
