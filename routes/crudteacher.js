const express = require("express");
const router = express.Router();
const Student = require("../model/Students");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
var MongoClient = require('mongodb').MongoClient;
const Assignment = require('../model/Assignment');
var url = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true"

var upcomingclassdetails = [];

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("HomeSchooling");
    router.post('/upcomingclasses', function(req, res) {
        dbo.collection('ScheduleData').find({ 'User': req.body.user }).toArray((err, cus) => {
            cus.forEach(item => {
                console.log('item',req.body);
                if(req.body.teacherName == item.TeacherName && req.body.subject == item.Subject) {
                    upcomingclassdetails.push(item);
                }
            })
            res.send(upcomingclassdetails);
            upcomingclassdetails = [];
        });
        
        console.info('Scheduler api for upcoming classes for teacher ui is called');
    })


});

router.post('/createassignment',async function(req,res) {
    const {classs,section,addassignment} = req.body;
    console.log('classs',classs);
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
                    c,section,
                    addassignment
                });
                dataStorage(c,section,addassignment);
                return res.status(200).json({
                    message: "Assignment is successfully added",
                })
            } catch(err){
                console.log("Error", err.message);
                res.status(500).send("Error in Storing Assignments to DB");
            }
    })

    async function dataStorage(classs,section, addassignment) {
        await Assignment.updateOne({
            class: classs,
            section: section,
        }, { $addToSet: { addassignment: addassignment } }, { upsert: true });
    }

    router.post('/getassignment',async function(req,res) {
        const {classs,section} = req.body;
        Assignment.find({class: req.body.class, section: section}, (err,assignment) => {
            res.send(assignment);
            if( err) throw err;
        })
    });

//)


module.exports = router;