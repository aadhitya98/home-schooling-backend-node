const mongoose = require("mongoose")

const StudentsXLSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
   
            class: {type: String},
            section: {type: String},
            studentName: {type: String},
            rollNumber: {type: String},
            _id : false
        

});

module.exports = mongoose.model("AddStudentXL",StudentsXLSchema);