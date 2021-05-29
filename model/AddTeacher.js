const mongoose = require("mongoose")

const TeacherSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    addteacher :[{
            uniqueID: { type: String, unique:true,dropDups: true }, 
            class: { type: String },
            section: { type: String },
            teacherName: { type: String },
            phoneNumber: { type: String },
            _id: false
    }]
})
module.exports = mongoose.model("AddTeachers",TeacherSchema);