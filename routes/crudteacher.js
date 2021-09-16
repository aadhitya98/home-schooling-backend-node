const express = require("express");
const router = express.Router();
const Student = require("../model/Students");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
var MongoClient = require('mongodb').MongoClient;
const Assignment = require('../model/Assignment');
var multer = require('multer');  
var url = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true"
var AssignmentFile = require('../model/AssignmentFile');
var upcomingclassdetails = [];

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("HomeSchooling");
    router.post('/upcomingclasses', function(req, res) {
        dbo.collection('ScheduleData').find({ 'User': req.body.user }).toArray((err, cus) => {
            cus.forEach(item => {
                console.log('item', req.body);
                if (req.body.teacherName == item.TeacherName && req.body.subject == item.Subject) {
                    upcomingclassdetails.push(item);
                }
            })
            res.send(upcomingclassdetails);
            upcomingclassdetails = [];
        });

        console.info('Scheduler api for upcoming classes for teacher ui is called');
    })


});

router.post('/changepassword', async function(req, res) {
    const { email, newPassword } = req.body;
    // const salt = await bcrypt.genSalt(15);
    // const encryptednewpassword = await bcrypt.hash(newPassword, salt)
    try {
        await User.updateOne({
                email: email
            }, { password: newPassword }

        );
        console.info('change password api in teacher UI is called');
    } catch (err) {
        console.log("Error", err.message);
        res.status(500).send("Error in Storing the details to the DB");
    }
    return res.status(200).json({
        message: "Password has been successfully changed"
    })

});

router.post('/createassignment', async function(req, res) {
    const { classs, section, addassignment } = req.body;
    console.log('classs', classs);
    //Assignment.find({"teacheremail": teacheremail},(err,assignment)=>{
    let assignmentteacher;
    try {
        let c = req.body.class
            // addassignment.forEach(async res => {
            //     console.log("res.teacheremail",res.teacheremail)
            //     assignmentteacher = await User.findOne({
            //         addassignment.teacheremail:res.teacheremail
            //     });
            // })

        // if (!assignmentteacher)
        //     return res.status(400).json({
        //         message: "Teacher Email Not Exists"
        //     });
        assignmentteacher = new Assignment({
            c,
            section,
            addassignment
        });
        dataStorage(c, section, addassignment);
        return res.status(200).json({
            message: "Assignment is successfully added",
        })
    } catch (err) {
        console.log("Error", err.message);
        res.status(500).send("Error in Storing Assignments to DB");
    }
})

async function dataStorage(classs, section, addassignment) {
    await Assignment.updateOne({
        class: classs,
        section: section,
    }, { $addToSet: { addassignment: addassignment } }, { upsert: true });
}

router.post('/getassignment', async function(req, res) {
    const { classs, section } = req.body;
    Assignment.find({ class: req.body.class, section: section }, (err, assignment) => {
        res.send(assignment);
        if (err) throw err;
    })
});

var assignmentstorage = multer.diskStorage({  
    destination:function(req,file,cb){  
        cb(null, __basedir + "/uploadAssignments/");
    },  
    filename(req,file,cb){  
        cb(null,file.originalname)  
    }  
})  
var assignupload = multer({storage:assignmentstorage}); 
router.post('/uploadAssignment',assignupload.single('file'),(req,res)=>{
    console.log('REQ',req);
    var assign = new AssignmentFile({
        filepath :"/uploadAssignments/"+ req.file.originalname,
        class : req.body.class,
        section: req.body.section,
        studentname: req.body.studentname,
        studentemail: req.body.studentemail,
        filename:  req.file.originalname
    })
    assign.save((err,data) => {
        if(err) console.log('Err',err);
        console.log('Data',data);
        res.send({message:"The data "+data+" is stored"});
    })
    console.log('Assignment upload API called');
});
router.post('/downloadAssignment',(req,res)=> {
    AssignmentFile.find({filename: req.body.filename},(err,data)=>{
        if(err) throw err;
        console.log('DATA',data);
        res.download( __dirname + data[0].filepath);
    })
    console.log('Assignment Download API called');

});


//)


module.exports = router;