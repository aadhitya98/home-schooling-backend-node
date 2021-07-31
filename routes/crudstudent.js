const express = require("express");
const router = express.Router();
const Student = require("../model/Students");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true"


router.post('/getstudent',function(req,res){
    const { createdUser, username, email, phonenumber } = req.body;
    let getstudents = [];

    Student.find({ "email":createdUser }, function(err, student) {
        student[student.length - 1].addstudent.forEach(element => {
            if (element != null) {
                if (element.studentName == username && element.phoneNumber == phonenumber && element.email == email)
                    getstudents.push(element);
            }
        })
        var response = {
            getstudents: getstudents
        }
        if (err) throw err;
        res.send(response);
        console.info('get students in students ui called');

    })
})

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("HomeSchooling");
router.post('/getclassfromschedule',function(req,res){
    let otherdetailsarray = [];
    otherdetailsarray = req.body.OtherDetails.split(" ")
    dbo.collection('ScheduleData').find({'OtherDetails':req.body.OtherDetails}).toArray((err, cus) => {
        // res.setHeader('Content-Type', 'text/html');
        res.send(cus);
    });
    console.info('Scheduler api for students is ui called');
})


});

router.post('/changepassword', async function(req,res){
    const {email, newPassword} = req.body;
    const salt = await bcrypt.genSalt(15);
    const encryptednewpassword = await bcrypt.hash(newPassword, salt)
    try {
    await User.updateOne({
        email: email
    },  { password: encryptednewpassword }
   
);
console.info('change password api in student UI is called');
}catch (err) {
    console.log("Error", err.message);
    res.status(500).send("Error in Storing the details to the DB");
}
return res.status(200).json({
    message: "Password has been successfully changed"
})

});
module.exports = router;