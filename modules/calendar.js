var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var Promise = require("bluebird");

//modify Date to support extra functions
require('datejs');

var exports = module.exports = {};

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

var oauth2Client;

//authorize(listEvents);

function getOAuthFromToken(token) {
    var client = newAuthClient();

    client.credentials = {
        access_token: token
    };

    return client;
}

function newAuthClient() {
    var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
    var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
    var redirectUrl = "http://freely.asharmalik.us/authorize";
    var auth = new googleAuth();
    var client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    return client;
}

function getOAuthclient() {
    if (oauth2Client == null) {
        var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
        var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
        var redirectUrl = "http://freely.asharmalik.us/authorize";
        var auth = new googleAuth();
        oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    }

    return oauth2Client;
}

exports.generateAuthUrl = function (meetingId, email) {
    var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
    var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
    var redirectUrl = "http://freely.asharmalik.us/authorize";
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    authUrl += "&state=mid:" + meetingId + "|email:" + email;

    return authUrl;
};

/**
 * Retrieve an access token from an auth code
 * @param code
 * @returns {bluebird|exports|module.exports}
 */
exports.retrieveToken = function (code) {
    return new Promise(function (resolve, reject) {
        getOAuthclient().getToken(code, function (err, token) {
            if (err) {
                reject('Error while trying to retrieve access token ' + err);
                return;
            }

            resolve(token.access_token);
        });
    });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            callback(oauth2Client);
        });
    });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
    var calendar = google.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log('No upcoming events found.');
        } else {
            console.log('Upcoming 10 events:');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

/**
 *
 * @param auth
 * @param startTime
 * @param endTime
 * @param callID
 */
exports.freebusy = function (auth, startTime, endTime, callID) {
    var calendar = google.calendar('v3');

    return new Promise(function (resolve, reject) {
        calendar.freebusy.query(
            {
                auth: auth,
                resource: {
                    items: [{id: callID}],
                    timeMin: startTime.toISOString(),
                    timeMax: endTime.toISOString()
                }
            },
            function (err, response) {
                //do a function here
                if (err) {
                    reject(err);
                    console.log('Error contacting freebusy: ' + err);
                    return;
                }

                var busy = [];

                for (var key in response.calendars) {
                    busy = response.calendars[key].busy;
                    break;
                }

                resolve(busy);
            });
    });
};

exports.getFreeTimes = function (usersData, startTime, endTime) {
    startTime = new Date(startTime);
    endTime = new Date(endTime);

    return new Promise(function (resolve, reject) {
        var obj = {
            usersData: usersData,
            current: 0,
            startTime: startTime,
            endTime: endTime,
            freeTimes: []
        };

        freeTimeHelper(obj, function (data) {
            var busyTimes = data;
            var flatList = [];

            console.log('busy times:');
            console.log(busyTimes);

            for(var i = 0;i<busyTimes.length;i++){
                flatList = flatList.concat(busyTimes[i]);
            }

            var dates = exports.mutualFreeTimes(flatList, startTime.toISOString(), endTime.toISOString());

            for(var i = 0;i<dates.length;i++){
                dates[i] =  new Date(dates[i]);

                dates[i].setTimezone("CST");

                dates[i] = dates[i].toDateString()+" "+dates[i].toLocaleTimeString();
            }

            resolve(dates);
        }, function (err) {
            reject(err);
        })
    });

};

//loads data one by one
function freeTimeHelper(obj, someFunc, someErrFunc) {
    var current = obj.current;
    var auth = obj.usersData[obj.current].google_cal_token;
    var email = obj.usersData[obj.current].email;

    if (obj.resolve == null) {
        obj.resolve = someFunc;
    }

    if (obj.reject == null) {
        obj.reject = someErrFunc;
    }

    exports.freebusy(getOAuthFromToken(auth), obj.startTime, obj.endTime, email)
        .then(function (data) {
            obj.freeTimes[current] = data;
            obj.current++;

            console.log('current: '+current);
            console.log(data);

            if (obj.current < obj.usersData.length) {
                freeTimeHelper(obj);
            } else {
                //done
                obj.resolve(obj.freeTimes);
            }
        })
        .catch(function (err) {
            obj.reject(err);
        });
}

//takes the list of busy times from the freebusy query
//takes the startTime and endTime in same format
//outputs list of strings that are hours in which they are free
//assume all in same timezone
exports.mutualFreeTimes = function (busytimes, startTime, endTime) {
    var start = Date.parse(startTime);
    var end = Date.parse(endTime);

    var current = new Date(start);
    var freetimes = [];
    while (current.isBefore(end)) {
        var dirty = false;
        for (var i = 0; i < busytimes.length; ++i) {
            var busy = busytimes[i];
            var bts = Date.parse(busy.start);
            var bte = Date.parse(busy.end);
            if ((current.isAfter(bts) || current.equals(bts)) && current.isBefore(bte)) {
                dirty = true;
            }
        }
        if (!dirty) {
            freetimes.push(current.toISOString());
        }

        current.addHours(1);
        //current.addMinutes(30);
    }

    return freetimes;
};