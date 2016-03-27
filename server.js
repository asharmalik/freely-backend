var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");

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
    var gcmToken = req.body.gcm; //gcm token of the originating user
    var calToken = req.body.calendar_token; //calendar token of the originating user
    var beginTime = req.body.begin_time; //beginning time MM/dd/yyyy hh:mm
    var endTime = req.body.end_time; //end time MM/dd/yyyy hh:mm
    var duration = req.body.duration; //duration in minutes
    var sessionId; //TODO: generate

    res.json({success: true, emails: emails, gcmToken: gcmToken, calToken: calToken, beginTime: beginTime, endTime: endTime, duration: duration});
});

/**
 * Get a meeting
 */
app.get('/meeting', function (req, res) {

});

/**
 * Get list of meetings for a user
 */
app.get('/meetings', function (req, res) {

});

/**
 * Get free times for a meeting
 */
app.get('/free-times', function (req, res) {

});

/**
 * Select a time for a meeting
 */
app.post('/select-time', function (req, res) {

});

/**
 * Authorization link emailed to users
 */
app.get('/authorize', function (req, res) {

});

db.connect();