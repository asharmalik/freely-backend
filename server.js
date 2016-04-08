var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");
var crypto = require('crypto');

var db = require("./modules/db.js");

var app = express();

var port = 4000;

app.use(bodyParser.urlencoded({extended: false})); //parsing get/post params

// Set server port
app.listen(port);

console.log('Listening on port '+port);

app.get('/', function (req, res) {
    res.send('hello world');
});

/**
 * Create a meeting
 */
app.post('/meeting', function (req, res) {
    var emails = req.body.emails; //first email is originating user
    var groupName = req.body.group_name;
    var gcmToken = req.body.gcm; //gcm token of the originating user
    var calToken = req.body.calendar_token; //calendar token of the originating user
    var beginTime = req.body.begin_time; //beginning time MM/dd/yyyy hh:mm
    var endTime = req.body.end_time; //end time MM/dd/yyyy hh:mm
    var duration = req.body.duration; //duration in minutes
    var sessionId;

    emails = JSON.parse(emails); //convert to array

    db.getNumSessions()
        .then(function (numSessions) {
            sessionId = numSessions;

            return db.createSession(sessionId, groupName, emails, calToken, gcmToken, beginTime, endTime, duration);
        })
        .then(function () {
            res.json({success: true});
        })
        .catch(function (err) {
            res.json({success: false, error: err});
        });

    //res.json({success: true, emails: emails, gcmToken: gcmToken, calToken: calToken, beginTime: beginTime, endTime: endTime, duration: duration, session: sessionId});
});

/**
 * Get a meeting
 */
app.get('/meeting', function (req, res) {
    var sessionId = req.query.session_id;

    res.json({success: true, sessionId: sessionId});
});

/**
 * Get list of meetings for a user
 */
app.get('/meetings', function (req, res) {
    var email = req.query.email;

    res.json({success: true, email: email});
});

/**
 * Get free times for a meeting
 */
app.get('/free-times', function (req, res) {
    var sessionId = req.query.session_id;

    res.json({success: true, sessionId: sessionId});
});

/**
 * Select a time for a meeting
 */
app.post('/select-time', function (req, res) {
    var sessionId = req.body.session_id;
    var beginTime = req.body.begin_time; //MM/dd/yyyy hh:mm
    var endTime = req.body.end_time; //MM/dd/yyyy hh:mm

    res.json({success: true, sessionId: sessionId, beginTime: beginTime, endTime: endTime});
});

/**
 * Authorization link emailed to users
 */
app.get('/authorize/:id', function (req, res) {
    //res.send()
});

db.connect();

//db.createSession(0, "group name", ['email1', 'email2'], "creator token", "gcm token", "begin", "end", 10);