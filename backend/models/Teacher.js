const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  class: String,
  subjects: [
    {
      _id: false,
      subject: String,
      classes: mongoose.Schema.Types.Mixed,
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
