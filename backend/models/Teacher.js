const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  _id: false,
  name: String,
  subjects: [
    {
      _id: false,
      subject: String,
      classes: { type: mongoose.SchemaTypes.Mixed },
    },
  ],
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("Teacher", teacherSchema);
