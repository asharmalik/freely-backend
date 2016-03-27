var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");

var db = require("./modules/db.js");

var app = express();

var port = 4000;

// Set server port
app.listen(port);

console.log('Listening on port '+port);

app.get('/', function (req, res) {
    res.send('hello world');
});

db.connect();

setTimeout(function () {
    db.getSessions()
        .then(function (data) {
            console.log(data);
        })
        .catch(function (err) {
            console.log(err);
        })
}, 1000);