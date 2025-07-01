const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  name: String,
  class: String,
  subjects: [
    {
      _id: false,
      subject: String,
      classes: Number,
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
