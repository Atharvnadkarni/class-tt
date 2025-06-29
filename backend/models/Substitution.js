const mongoose = require("mongoose");
const Teacher = require("./Teacher");

const subSchema = new mongoose.Schema({
    class: String,
    period: String,
    date: Date,
    teacher: mongoose.Schema.Types.Mixed
})

module.exports = mongoose.model("Substitution", subSchema);