const express = require("express");
const router = express.Router();
const Teacher = require("../model/AddTeacher");
const User = require("../model/User");

router.post('/getallteachers', function(req,res) {
    const { email } = req.body;
    let getAllTeachers = [];
    Teacher.find({ "email": email },(err,teacher) => {
        teacher[teacher.length - 1].addteacher.forEach(element => {
            getAllTeachers.push(element);
        })
        console.log("TEEAAAA",getAllTeachers)
        res.send(getAllTeachers);
        if(err) throw err;
    })
    

})
router.post("/getteachers/:class/:section", function(req, res) {

    const { email } = req.body;
    let getteachers = [];


    Teacher.find({ "email": email }, function(err, teacher) {
        teacher[teacher.length - 1].addteacher.forEach(element => {
            if (element != null) {
                if (element.class == req.params.class && element.section == req.params.section)
                    getteachers.push(element);
            }
        })
        var response = {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            getteachers: getteachers
        }
        if (err) throw err;
        res.send(response);
        console.info('get teachers based on class api called');

    })
})


router.post('/addteacherdetails', async function(req, res) {
    const { email, addteacher } = req.body;
    try {
        let addteacheruser = await User.findOne({
            email
        });
        let uniqueIDArray = [];
        uniqueIDflag = false;

        if (!addteacheruser)
            return res.status(400).json({
                message: "Email Not Exists"
            });
        Teacher.find({ email: email }, function(err, teacher) {
            console.log('TEACHER', teacher);
            if (teacher.length != 0) {
                teacher[teacher.length - 1].addteacher.forEach(element => {
                    uniqueIDArray.push(element.uniqueID);
                })
                console.log('uniqueIDArray', uniqueIDArray);
                addteacher.forEach(teacher => {
                    if (uniqueIDArray.includes(teacher.uniqueID)) {
                        uniqueIDflag = true;
                        return;
                    }
                })
                if (uniqueIDflag) {
                    return res.status(400).json({ message: "Unique ID already exists" });
                } else {
                    addteacheruser = new Teacher({
                        email,
                        addteacher
                    });
                    dataStorage(email, addteacher)
                    return res.status(200).json({
                        message: "Teacher is successfully added",
                    })
                }
            } else {
                addteacheruser = new Teacher({
                    email,
                    addteacher
                });

                dataStorage(email, addteacher)
                return res.status(200).json({
                    message: "Teacher is successfully added",
                })

            }
            console.log('addTeacher', addteacher[0].uniqueID);
        })

    } catch (err) {
        console.log("Error", err.message);
        res.status(500).send("Error in Storing the details to the DB");
    }
    console.info('Add teacher details api called');
})
async function dataStorage(email, addteacher) {
    await Teacher.updateOne({
        email: email
    }, { $addToSet: { addteacher: addteacher } }, { upsert: true });
}

router.post("/getteacherdetails", function(req, res) {

    const { email, teachername, classname, section, phonenumber } = req.body;
    let getteachers = [];

    Teacher.find({ "email": email }, function(err, teacher) {
        teacher[teacher.length - 1].addteacher.forEach(element => {
            if (element != null) {
                if (element.class == classname && element.section == section && element.teacherName == teachername &&element.phoneNumber == phonenumber)
                    getteachers.push(element);
            }
        })
        var response = {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            getteachers: getteachers
        }
        if (err) throw err;
        res.send(response);
        console.info('get teacher details api called');

    })
})

module.exports = router;