var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");
var path = require('path');

var db = require("./modules/db.js");
var email = require("./modules/email.js");
var calendar = require("./modules/calendar.js");

var app = express();

var port = 8888;

app.use(bodyParser.urlencoded({extended: false})); //parsing get/post params
app.use(express.static('public'));

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

            beginTime = new Date(beginTime);
            endTime = new Date(endTime);


            return db.createSession(sessionId, groupName, emails, calToken, gcmToken, beginTime.toISOString(), endTime.toISOString(), duration);
        })
        .then(function () {
            email.sendAuthorizationEmail(emails, sessionId);
            res.json({success: true});
        })
        .catch(function (err) {
            res.json({success: false, error: err});
        });
});

/**
 * Get a meeting
 */
app.get('/meeting', function (req, res) {
    var sessionId = req.query.session_id;

    db.getSession(0)
        .then(function (data) {
            res.json({success: true, data: data});
        })
        .catch(function (err) {
            res.json({success: false, error: err});
        });
});

/**
 * Get list of meetings for a user
 */
app.get('/meetings', function (req, res) {
    var email = req.query.email;

    db.getSessionsForEmail(email)
        .then(function (data) {
            res.json({success: true, data:data});
        })
        .catch(function (err) {
            res.json({success: false, error: err});
        });
});

/**
 * Get free times for a meeting
 */
app.get('/free-times', function (req, res) {
    var sessionId = req.query.session_id;
    var startTime = req.body.begin_time;

    db.getSession(sessionId)
        .then(function (data) {
            var startTime = data[0].begin_time;
            var endTime = data[0].end_time;

            return calendar.getFreeTimes(data, startTime, endTime);
        })
        .then(function (data) {
            res.json({success: true, data: data});
        })
        .catch(function (err) {
            res.json({success: false});
        });


    //calendar.freebusy( sessionId, startTime, endTime, callID );

    res.json({success: true, sessionId: sessionId});
});

/**
 * Authorization link emailed to users
 */
app.get('/authorize', function (req, res) {
    var state = req.query.state;
    var code = req.query.code;
    var meetingId = state.split("|")[0].split(":")[1];
    var email = state.split("|")[1].split(":")[1];

    calendar.retrieveToken(code)
        .then(function (token) {
            return db.setCalendarTokenForUser(meetingId, email, token);
        })
        .then(function () {
            res.send("Successful!");
        })
        .catch(function (error) {
            res.send("There was some error: "+error.toString());
        });
});

db.connect();