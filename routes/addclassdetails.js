const express = require("express");
const router = express.Router();
const addDetails = require('../model/AddClass');
const User = require("../model/User");
const Student = require("../model/Students");
const multer = require('multer');
const readXlsxFile = require("read-excel-file/node");
global.__basedir = __dirname;

router.post('/addclassdetails', async function(req, res) {
    const { email, addclass } = req.body;
    try {
        let addclassuser = await User.findOne({
            email
        });
        if (!addclassuser)
            return res.status(400).json({
                message: "Email Not Exists"
            });
        addclassuser = new addDetails({
            email,
            addclass
        });
        // await addclassuser.save();
        // let addclassuseremail = await addDetails.findOne({
        //     email
        // });
        // if(addclassuseremail) {
        await addDetails.updateOne({
            email: email
        }, { $addToSet: { addclass: addclass } }, { upsert: true });
        //}



    } catch (err) {
        console.log("Error", err.message);
        res.status(500).send("Error in Storing the details to the DB");

    }

    // console.log('REQ',req.body);
    // console.log('EMAIL',email);
    console.log('Req', addclass);

})

// router.get('/dropdowndetails', async(req, res) => {
//     try {
//         let classList = [];
//         let sectionList = []
//         const details = await addDetails.find()

//         details.forEach(info => {
//             info['addclass'].forEach(det => {
//                 classList.push(det['className'])
//                 sectionList.push(det['sectionName'])
//             })
//         })

//         res.status(200).send(classList + "\n" + sectionList)
//     } catch (err) {
//         res.send({
//             message: "Error"
//         })
//     }
// })
router.post('/addstudentdetails', async function(req, res) {
    const { email, addstudent } = req.body;
    try {
        let addstudentuser = await User.findOne({
            email
        });
        if (!addstudentuser)
            return res.status(400).json({
                message: "Email Not Exists"
            });
        addstudentuser = new Student({
            email,
            addstudent
        });
        await Student.updateOne({
                email: email
            }, { $addToSet: { addstudent: addstudent } }, { upsert: true }

        );
        return res.status(200).json({
            message: "Student is successfully added",
        })

    } catch (err) {
        console.log("Error", err.message);
        res.status(500).send("Error in Storing the details to the DB");
    }
})
const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheetml")
    ) {
        cb(null, true);

    } else {
        cb("Please upload only excel file.", false);
    }
};
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __basedir + "/uploadStudentXL/");
    },
    filename: (req, file, cb) => {
        console.log("File name is", file.originalname);
        cb(null, `${Date.now()}-homeschooling-${file.originalname}`);
    },

});
var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
const uploaded = async(req, res) => {
    try {
        console.log("Details", req.body)
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }



        let path =
            __basedir + "/uploadStudentXL/" + req.file.filename;

        readXlsxFile(path).then((rows) => {

            rows.shift();

            let studentdata = [];

            rows.forEach((row) => {
                let student = {
                    rollNumber: row[0],
                    studentName: row[1],
                    class: row[2],
                    section: row[3],
                    teacherName: row[4],
                    phoneNumber: row[5]
                };
                // studentdata.push(email);
                studentdata.push(student);
            });
            //db = client.db('HomeSchooling');
            //addstudents = db.collection('addstudents')
            console.log("EMAIL", req.body.email);
            Student.updateMany({
                    email: req.body.email
                }, { $addToSet: { addstudent: studentdata } }, { upsert: true })
                .then(() => {
                    res.status(200).send({
                        message: "Uploaded the file successfully: " + req.file.originalname,
                    });
                })
                .catch((error) => {
                    res.status(500).send({
                        message: "Fail to import data into database....",
                        error: error.message,
                    });
                });
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};
router.post("/uploadstudentxl", uploadFile.single("file"), uploaded);
router.post("/getallstudents/:class/:section",function(req,res){
   // const classs = req.params.class;
   // const section = req.params.section;
    //console.log('PARAM',req.params.email)
//     Student.addstudent.forEach(function(element) 
// { 
//     console.log(Student.length) 
// });
const { email } = req.body;
// addstudentuser = new Student({
//     email,
//     addstudent
// });
       const elementsArray = [];
        Student.find({"email":email},function(err,student){
            //Student.find({"addstudent.class":req.params.class},function(err,student){
               //console.log("AAA",student[student.length-1].addstudent) 
                student[student.length-1].addstudent.forEach(element => {
                    if(element!=null){
                        if(element.class == req.params.class && element.section == req.params.section )
                        elementsArray.push(element);
                    }

                })
                if(err) throw err;
                var response = {
                    statusCode: 200,
                    headers:  { 'Content-Type': 'application/json' },
                    students:    elementsArray
                  }
                res.send(response);

       
            //})
       // }
    // }))

})
})

router.get("/countallstudents/:class/:section",function(req,res){
         var count = 0;
         const { email } = req.body;

         Student.find({"email":email},function(err,student){
                 student[student.length-1].addstudent.forEach(element => {
                     if(element!=null){
                         if(element.class == req.params.class && element.section == req.params.section )
                         count++;
                     }
 
                 })
                 var response = {
                    statusCode: 200,
                    headers:  { 'Content-Type': 'application/json' },
                    count:    count
                  }
                 console.log('count',count);
                  if(err) throw err;
                  res.send(response);
 
 })
 })
module.exports = router;