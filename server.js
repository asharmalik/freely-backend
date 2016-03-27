var express = require('express');
var bodyParser = require("body-parser");
var Promise = require("bluebird");

var app = express();

var port = 4000;

// Set server port
app.listen(port);

app.get('/', function (req, res) {
    res.send('hello world');
});