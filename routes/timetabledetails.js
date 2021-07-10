var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
var url = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true"

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("HomeSchooling");

router.post("/gettimetabledata", (req, res) => {
    
    let otherdetailsarray = [];
    otherdetailsarray = req.body.OtherDetails.split(" ")
    dbo.collection('ScheduleData').find({'OtherDetails':req.body.OtherDetails}).toArray((err, cus) => {
        // res.setHeader('Content-Type', 'text/html');
        res.send(cus);
    });

});


router.post("/updatetimetabledata", (req, res) => {
    
    let otherdetailsarray = [];
    otherdetailsarray = req.body.OtherDetails.split(" ")

    var eventData = [];
    let duplicateFlag = false;
    
    dbo.collection('ScheduleData').find({'User':req.body.user}).toArray((err, cus) => {
        console.log('Req.body',req.body);
        console.log('CUSS',cus);
        cus.forEach(cusss => {
            req.body.added.forEach(element => {
                const starttimeelement = new Date(element.StartTime);
                const starttimecus = new Date(cusss.StartTime);
                const endtimeelement = new Date(element.EndTime);
                const endtimecus = new Date(cusss.EndTime);
               
                 console.log('element.StartTime',starttimeelement.getTime())
                console.log('starttimecus.getTime()',starttimecus.getTime());
                console.log('endtimeelement.getTime()',endtimeelement.getTime())
                console.log('endtimecus.getTime()',endtimecus.getTime())

                if(element.TeacherName == cusss.TeacherName && (starttimeelement.getTime() + 330) === starttimecus.getTime() && (endtimeelement.getTime() +330) === endtimecus.getTime()){
                    duplicateFlag = true;
                    // (req.body.action == "insert") ? eventData.push(req.body.value) : eventData = req.body.added;
                    // console.log("EVENT DATA",eventData);
                    // for (var i = 0; i < eventData.length; i++) { 
                    //     eventData[i].errorMsg = "Duplicate Schedule found for the teacher";
                    // }
                    // delete eventData[i];
                    console.log('Duplicate schedule');  
                }
                console.log("DUP",duplicateFlag)
            });
            
        })
     
        if(err) {
            return next(err);
        }
        
        if(!duplicateFlag){
        if (req.body.action == "insert" || (req.body.action == "batch" && req.body.added.length > 0)) {
       
            (req.body.action == "insert") ? eventData.push(req.body.value) : eventData = req.body.added;
            
            console.log("DUP4",duplicateFlag)
            for (var i = 0; i < eventData.length; i++) {
                var sdate = new Date(eventData[i].StartTime);
                var edate = new Date(eventData[i].EndTime);
                //console.log(' eventData[i].StartTime before', eventData[i].StartTime);
                eventData[i].StartTime = (new Date(+sdate - (sdate.getTimezoneOffset() * 1)));
                console.log('Event[i]',eventData[i])
                //console.log(' eventData[i].StartTime after', eventData[i].StartTime);
                eventData[i].EndTime = (new Date(+edate - (edate.getTimezoneOffset() * 1)));
                eventData[i].OtherDetails = req.body.OtherDetails;
                eventData[i].User = req.body.user;
                
                console.log('Duplciate Flaggg',duplicateFlag);
                
                dbo.collection('ScheduleData').insertOne(eventData[i]);
                
                
            }
            res.send(req.body);
        
        
        }
        if (req.body.action == "update" || (req.body.action == "batch" && req.body.changed.length > 0)) {
            (req.body.action == "update") ? eventData.push(req.body.value) : eventData = req.body.changed;
            for (var i = 0; i < eventData.length; i++) {
                delete eventData[i]._id;
                var sdate = new Date(eventData[i].StartTime);
                var edate = new Date(eventData[i].EndTime);
                eventData[i].StartTime = (new Date(+sdate - (sdate.getTimezoneOffset() * 60000)));
                eventData[i].EndTime = (new Date(+edate - (edate.getTimezoneOffset() * 60000)));
                eventData[i].OtherDetails = req.body.OtherDetails;
                
                
                
                dbo.collection('ScheduleData').updateOne({ "Id": eventData[i].Id }, { $set: eventData[i] });
              
            }
            res.send(req.body);
        }
        if (req.body.action == "remove" || (req.body.action == "batch" && req.body.deleted.length > 0)) {
            (req.body.action == "remove") ? eventData.push({ Id: req.body.key }) : eventData = req.body.deleted;
            for (var i = 0; i < eventData.length; i++) {
                dbo.collection('ScheduleData').deleteOne({ "Id": eventData[i].Id });
            }
            res.send(req.body);
        }
    } else {
        res.send({errorMessage:"Duplicate Schedule for the teacher"});
    }
    });
 

    
});
});

module.exports = router;