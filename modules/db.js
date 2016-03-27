var exports = module.exports = {};

var squel = require("squel");
var mysql = require('mysql');

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