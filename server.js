var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");
var path = require('path');

var db = require("./modules/db.js");
var email = require("./modules/email.js");

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

    res.json({success: true, email: email});
});

//TODO
/**
 * Get free times for a meeting
 */
app.get('/free-times', function (req, res) {
    var sessionId = req.query.session_id;

    res.json({success: true, sessionId: sessionId});
});

//TODO
/**
 * Select a time for a meeting
 */
app.post('/select-time', function (req, res) {
    var sessionId = req.body.session_id;
    var beginTime = req.body.begin_time; //MM/dd/yyyy hh:mm
    var endTime = req.body.end_time; //MM/dd/yyyy hh:mm

    //TODO: send out emails for scheduled time

    res.json({success: true, sessionId: sessionId, beginTime: beginTime, endTime: endTime});
});

/**
 * Authorization link emailed to users
 */
app.get('/authorize/:session/:email', function (req, res) {
    //res.send()
    var session = req.params.session;
    var email = req.params.email;

    //TODO: show google login page
    res.sendFile(path.join(__dirname, './html', 'authorize.html'));
});

db.connect();

//db.createSession(0, "group name", ['email1', 'email2'], "creator token", "gcm token", "begin", "end", 10);