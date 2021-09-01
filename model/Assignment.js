const mongoose = require("mongoose")

const AssignmentSchema = mongoose.Schema({

    class: {
        type: String,
        required: true
    },
    section: {
        type: String,
        required: true
    },
    addassignment : [
        {
            subjectname: {
                type: String,
                required: true
            },
            staffname: {
                type: String,
                required: true
            },
            teacheremail : {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            lastdate: {
                type: String,
                required: true
            },
            submissionformat: {
                type: String,
                required: true
            },
            marks: {
                type: String,
                required: true
            },
            modeofdelivery: {
                type: String,
                required: true
            },
            _id: false
    }
]
   
});

module.exports = mongoose.model("Assignment", AssignmentSchema);