const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: String,
    class: String,
    username: {type: String, unique: true},
    subjects: [{
        _id: false,
        subject: String,
        classes: {type: mongoose.SchemaTypes.Mixed}
    }]
})

module.exports = mongoose.model("Teacher", teacherSchema);