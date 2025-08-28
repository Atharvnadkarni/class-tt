const mongoose = require("mongoose");
const Teacher = require("./Teacher");

const subSchema = new mongoose.Schema({
    class: {type: String, required: true},
    period: {type: String, required: true},
    date: {type: Date, required: true},
    teacher: {type: mongoose.Schema.Types.Mixed, required: true},
})

module.exports = mongoose.model("Substitution", subSchema);