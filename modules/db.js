var exports = module.exports = {};

var squel = require("squel");
var mysql = require('mysql');
var Promise = require("bluebird");

var pool; //mysql connection pool

Promise.promisifyAll(squel);


exports.connect = function () {
    pool = mysql.createPool({
        host: '104.236.89.233',
        user: 'root',
        password: 'password',
        database: "freely"
    });
};

exports.disconnect = function (callback) {
    return new Promise(function (resolve, reject) {
        pool.end(function (err) {
            if(err) return reject(err);
            resolve();
        })
    });
};

exports.getSessions = function () {
    var query = squel.select().from("Sessions").toParam();

    return dbQuery(query.text, query.values);
};

/**
 * Return data for a session
 * @param sessionId
 */
exports.getSession = function (sessionId) {
    var query = squel.select()
        .from("Sessions")
        .where("session_id = ?", sessionId)
        .toParam();

    return new Promise(function (resolve, reject) {
        dbQuery(query.text, query.values)
            .then(resolve)
            .catch(reject);
    });
};

/**
 * Get sessions for a specific email
 * @param email
 */
exports.getSessionsForEmail = function (email) {
    var query = squel.select()
        .from("Sessions")
        .where("email = ?", email)
        .toParam();

    return new Promise(function (resolve, reject) {
        dbQuery(query.text, query.values)
            .then(resolve)
            .catch(reject);
    });

};

/**
 * Create a session
 * @param sessionId session id
 * @param groupName Name of the group
 * @param emails List of emails
 * @param creatorCalendarToken The calendar token for the creating user
 * @param creatorGCMToken The gcm token for the creating user
 * @param beginTime Begin time MM/dd/yyyy hh:mm
 * @param endTime End time MM/dd/yyyy hh:mm
 * @param duration Duration in minutes
 */
exports.createSession = function (sessionId, groupName, emails, creatorCalendarToken, creatorGCMToken, beginTime, endTime, duration) {
    //insert into Sessions VALUES ("dsfsdfsdf", "test", "aa@aa.com", "token", null, 0, "begin", "end", 10), ("dsfsdfsdf", "test", "bb@bb.com", "token", "gcm token", 0, "begin", "end", 10);
    var query = "insert into Sessions VALUES";

    for(var i = 0;i<emails.length;i++){
        var email = emails[i];
        var calendarToken = (i == 0)?"'"+creatorCalendarToken+"'":null;
        var gcmToken = (i == 0)?"'"+creatorGCMToken+"'":null;
        var values = "("+sessionId+", '"+groupName+"','"+email+"',"+calendarToken+","+gcmToken+","+ 0 +",'"+beginTime+"', '"+endTime+"',"+duration+")";

        query+=values;
        if(i+1<emails.length){ //ANOTHA ONE
            query+=",";
        }
    }

    return new Promise(function (resolve, reject) {
        dbQuery(query)
            .then(function (data) {
                if(data.affectedRows>0){
                    resolve();
                }else{
                    reject();
                }
            })
    });
};

exports.getTokensAndNames = function (sessionId) {
    var query = squel.select()
        .from("Sessions")
        .field("google_cal_token")
        .field("email")
        .where("session_id = ?", sessionId)
        .toParam();

    return new Promise(function (resolve, reject) {
        dbQuery(query.text, query.values)
            .then(resolve)
            .catch(reject);
    });

};

exports.setCalendarTokenForUser = function (meetingId, email, token) {
    var query = squel.update()
        .table("Sessions")
        .set("google_cal_token", token)
        .where("session_id = ?", meetingId)
        .where("email = ?", email)
        .toParam();

    return new Promise(function (resolve, reject) {
        dbQuery(query.text, query.values)
            .then(function (data) {
                if (data.affectedRows > 0) {
                    resolve();
                } else {
                    reject();
                }
            })
            .catch(reject);
    });
};

exports.getNumSessions = function () {
    var query = "select MAX(session_id) from Sessions;";

    return new Promise(function (resolve, reject) {
        dbQuery(query)
            .then(function (data) {
                var num = data[0]['MAX(session_id)'];

                if(num == null) num = 0;

                resolve(num);
            })
    });
};

exports.haveAllTokens = function (sessionId) {
    return new Promise(function (resolve, reject) {
        exports.getSession(sessionId)
            .then(function (data) {
                var haveAllTokens = true;

                for(var i = 0;i<data.length;i++){
                    if(data[i].google_cal_token == null){
                        haveAllTokens = false;
                    }
                }

                resolve(haveAllTokens);
            })
            .catch(reject);
    });
};

function dbQuery(text, values) {
    if (values == undefined) {
        values = [];
    }

    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err);
            }

            connection.query(text, values, function (err, rows, field) {
                connection.release();

                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}