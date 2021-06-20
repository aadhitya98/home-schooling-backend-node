var MongoClient = require('mongodb').MongoClient;
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
var url = "mongodb+srv://home-schooling:godislove158@cluster0.ncicr.mongodb.net/HomeSchooling?w=majority&retryWrites=true"

MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("HomeSchooling");

router.post("/gettimetabledata", (req, res) => {
    console.log('Req in getdata',req);
    let otherdetailsarray = [];
    otherdetailsarray = req.body.OtherDetails.split(" ")
    console.log('otherdetailsarray',otherdetailsarray.toString());
    dbo.collection('ScheduleData').find({'OtherDetails':req.body.OtherDetails}).toArray((err, cus) => {
        res.send(cus);
    });
});


router.post("/updatetimetabledata", (req, res) => {
    console.log('req.body',req.body);
    var eventData = [];
    if (req.body.action == "insert" || (req.body.action == "batch" && req.body.added.length > 0)) {
        (req.body.action == "insert") ? eventData.push(req.body.value) : eventData = req.body.added;
        for (var i = 0; i < eventData.length; i++) {
            var sdate = new Date(eventData[i].StartTime);
            var edate = new Date(eventData[i].EndTime);
            console.log(' eventData[i].StartTime before', eventData[i].StartTime);
            eventData[i].StartTime = (new Date(+sdate - (sdate.getTimezoneOffset() * 1)));
            console.log('Event[i]',eventData[i])
            console.log(' eventData[i].StartTime after', eventData[i].StartTime);

            eventData[i].EndTime = (new Date(+edate - (edate.getTimezoneOffset() * 1)));
            eventData[i].OtherDetails = req.body.OtherDetails;
            dbo.collection('ScheduleData').insertOne(eventData[i]);
        }
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
    }
    if (req.body.action == "remove" || (req.body.action == "batch" && req.body.deleted.length > 0)) {
        (req.body.action == "remove") ? eventData.push({ Id: req.body.key }) : eventData = req.body.deleted;
        for (var i = 0; i < eventData.length; i++) {
            dbo.collection('ScheduleData').deleteOne({ "Id": eventData[i].Id });
        }
    }
    res.send(req.body);
});
});

module.exports = router;