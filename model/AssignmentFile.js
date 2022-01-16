const mongoose = require("mongoose")

const AssignmentFileSchema = new mongoose.Schema({
    filepath: String,
    class: String,
    section: String,
    studentname: String,
    studentemail: String,
    teacheremail: String,
    filename: String
});

module.exports = mongoose.model('AssignmentFiles',AssignmentFileSchema)  