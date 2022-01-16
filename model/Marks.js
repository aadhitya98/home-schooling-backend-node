const mongoose = require("mongoose")

const MarksSchema = new mongoose.Schema({
 
    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    addmarks : [
        {
            studentemail: {
                type: String,
                required: true
            },
            studentname: {
                type: String,
                required: true
            },
            teacheremail : {
                type: String,
                required: true
            },
            filename: {
                type: String,
                required: true
            },
            mark: {
                type: String,
                required: true
            },
            _id: false
    }
]
   
});


module.exports = mongoose.model('AssignmentMarks', MarksSchema);  