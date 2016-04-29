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

function getOAuthclient(){
    if(oauth2Client == null){
        var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
        var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
        var redirectUrl = "http://freely.asharmalik.us/authorize";
        var auth = new googleAuth();
        oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
    }

    return oauth2Client;
}

exports.generateAuthUrl = function(meetingId, email){
    var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
    var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
    var redirectUrl = "http://freely.asharmalik.us/authorize";
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });

    authUrl+="&state=mid:"+meetingId+"|email:"+email;

    return authUrl;
};

exports.retrieveToken = function(code) {
    return new Promise(function (resolve, reject) {
        getOAuthclient().getToken(code, function (err, token) {
            if (err) {
                reject('Error while trying to retrieve access token '+ err);
                return;
            }

            resolve(token.access_token);
        });
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(callback) {
    var clientSecret = "qinfghlkr3PpzkhqGJkkwvFY";
    var clientId = "292287318292-49ifkmri2u33g87ijdfa7nacbcpsuo58.apps.googleusercontent.com";
    var redirectUrl = "http://freely.asharmalik.us";
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    //oauth2Client.credentials = {
    //    access_token: 'ya29..xQJi43Y2nE3H7PNDRcKKIzZyidKwItB1Q8RTurX4MSvVSKB0l35pQSU2aVVtznAYKw',
    //    //token_type: 'Bearer',
    //    //expiry_date: 1460749028250
    //};
    //
    //callback(oauth2Client);

    //oauth2Client.getToken("code from auth url", function(err, token) {
    //    if (err) {
    //        console.log('Error while trying to retrieve access token', err);
    //        return;
    //    }
    //    console.log(token);
    //      token.access_token
    //    oauth2Client.credentials = token;
    //    callback(oauth2Client);
    //});

    //Check if we have previously stored a token.
    //fs.readFile(TOKEN_PATH, function(err, token) {
    //    if (err) {
    //        getNewToken(oauth2Client, callback);
    //    } else {
    //        oauth2Client.credentials = JSON.parse(token);
    //        callback(oauth2Client);
    //    }
    //});
}

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

    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
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
    }, function(err, response) {
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

//[ { google_cal_token: 'ya29..zwKlKfAFIbdIbdrbINaada1lP9Wa9ywXWW35ZZ9PMelgBFQCUkUQm0adiRqzOwPIXFM',
//    email: 'asharm95@gmail.com' },
//    { google_cal_token: 'ya29..zwLUNfEhnquQBzxZ4vc_IRGEN91EYONkjbemNiYTGluB6lTWen7xSQuDfqPy-rr-1Q',
//        email: 'rohannagar11@gmail.com' } ]

/**
 *
 * @param auth
 * @param startTime
 * @param endTime
 * @param callID
 */
exports.freebusy = function(auth, startTime, endTime, callID){
    var calendar = google.calendar('v3');

    return new Promise(function (resolve, reject) {

        calendar.freebusy.query(
            {
                auth: auth,
                items: [{id: callID}],
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString()
            },
            function (err, response) {
                //do a function here
                if (err) {
                    reject(err);
                    console.log('Error contacting freebusy: ' + err);
                    return;
                }
                var busytimes = response[callID]['busy'];
                if (busytimes.length == 0) {
                    console.log('No free times');
                } else {
                    console.log('free time at: ' + busytimes);
                }

                resolve(busytimes);
            });
    });
};

exports.getFreeTimes = function (usersData, startTime, endTime) {
    return new Promise(function (resolve, reject) {
        var freeTimes = [];

        var obj = {
            usersData: usersData,
            current: 0,
            startTime: startTime,
            endTime: endTime,
            freeTimes: []
        };

        freeTimeHelper(obj, function (data) {
            console.log(data);
        }, function (err) {
            console.log(err);
        })
    });

};

//ya29..zwKlKfAFIbdIbdrbINaada1lP9Wa9ywXWW35ZZ9PMelgBFQCUkUQm0adiRqzOwPIXFM
//ya29..zwLUNfEhnquQBzxZ4vc_IRGEN91EYONkjbemNiYTGluB6lTWen7xSQuDfqPy-rr-1Q

//loads data one by one
function freeTimeHelper(obj, someFunc, someErrFunc){
    var current = obj.current;
    var auth = obj.usersData[obj.current].google_cal_token;
    var email = obj.usersData[obj.current].email;

    if(obj.resolve == null) {
        obj.resolve = someFunc;
    }

    if(obj.reject == null){
        obj.reject = someErrFunc;
    }

    exports.freebusy(auth, obj.startTime, obj.endTime, email)
        .then(function (data) {
            //obj.freeTimes[current] = data;
            //obj.current++;

            //if(obj.current<obj.usersData.length){
            //    freeTimeHelper(obj);
            //}else{
            //    //done
            //    console.log('done');
            //    obj.resolve(obj.freeTimes);
            //}
        })
        .catch(function (err) {
            obj.reject(err);
        });
}

//takes the list of busy times from the freebusy query
//takes the startTime and endTime in same format
//outputs list of strings that are hours in which they are free
//assume all in same timezone
exports.mutualFreeTimes = function( busytimes, startTime, endTime ){
    var start = Date.parse(startTime);
    var end = Date.parse(endTime);
    
    var current = new Date(start);
    var freetimes = [];
    while( current.isBefore(end) ){
	var dirty = false;
	for(var i = 0; i < busytimes.length; ++i ){
	    var busy = busytimes[i];
	    var bts = Date.parse(busy.start);
	    var bte = Date.parse(busy.end);
	    if( current.isAfter( bts ) && current.isBefore( bte ) ){
		dirty = true;
	    }
	}
	if( !dirty ){
	    freetimes.push(current.toISOString());
	}

	current.addHours(1);
    }

    return freetimes;
};

//user clicks link which redirects them to login
//user logs in and gets redirected to page which takes their code and generates an access token and stores in backend

//console.log(exports.generateAuthUrl(0, "rohannagar11@gmail.com"));
