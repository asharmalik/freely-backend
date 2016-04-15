var exports = module.exports = {};

var sendgrid  = require('sendgrid')('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');
var calendar = require("./calendar.js");

exports.sendEmail = function (email, subject, body) {
    var payload   = {
        to      : email,
        from    : 'authorize@freely.com',
        subject : subject,
        text    : body
    };

    sendgrid.send(payload, function(err, json) {
        if (err) { console.error(err); }
        //console.log(json);
    });
};

exports.sendAuthorizationEmail = function (emails, sessionId) {
    //Hello, you have been invited to a meeting on Freely. Authorize your email to join the meeting! <url>

    for(var i = 0;i<emails.length;i++){
        var authUrl = calendar.generateAuthUrl(sessionId, emails[i]);
        var text = "Hello,\n You have been invited to a meeting on Freely. Authorize your email to join the meeting!\n"+authUrl;

        exports.sendEmail(emails[i], "You have been invited to a meeting. Authorization required!", text);
    }
};