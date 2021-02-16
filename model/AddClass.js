const mongoose = require("mongoose")

const AddClassSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    addclass: [
        {
            className: {type: String},
            sectionName: {type: String},
            _id : false
        },
       
    ]

});

module.exports = mongoose.model("AddClass",AddClassSchema);