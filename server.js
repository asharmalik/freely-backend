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