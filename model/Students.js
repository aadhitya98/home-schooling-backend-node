const mongoose = require("mongoose")

const StudentSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    addstudent: [
        {
            class: {type: String},
            section: {type: String},
            studentName: {type: String},
            rollNumber: {type: String},
            _id : false
        },
       
    ]

});

module.exports = mongoose.model("AddStudent",StudentSchema);