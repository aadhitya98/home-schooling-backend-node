const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    role: {
        type: String,
        default: 'User'
    },
    createdUser : {
        type: String
    },
    subject: {
        type: String
    }

});
module.exports = mongoose.model("user" , UserSchema);