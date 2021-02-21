const express = require("express");
const router = express.Router();
const addDetails = require('../model/AddClass');
const User = require("../model/User");

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


module.exports = router;