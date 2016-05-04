var assert = require('chai').assert;
var calendar = require('../modules/calendar.js');
var db = require("../modules/db.js");

require("datejs");

describe('Calendar', function() {
    describe('#mutualFreeTimes()', function () {
	it('should return 0 when no freetimes', function () {
	    var busies = [ 
		{ start : "2016-04-13T07:00:00", end : '2016-04-13T09:00:00' },
		{ start : "2016-04-13T08:00:00", end : '2016-04-13T10:00:00' },
	    ];
	    var startTime = '2016-04-13T07:00:00';
	    var endTime = '2016-04-13T11:00:00';
	    
	    // var meh = Date.parse(startTime);
	    // console.log(meh.toISOString());
	    // console.log( "calculating free times" );
	    var free = calendar.mutualFreeTimes( busies, startTime, endTime );
	    // console.log( "finished free times" );
	    // console.log(free);
	    assert.isAbove(free.length, 0, "free has something");
	    assert.equal(free.length, 1);
	});
    });
});


describe('Calendar', function() {
    describe('#FreeTimeswithDB()', function () {
	it('should return 0 when no freetimes', function () {
	    db.connect();
	    
	    var free;
	    db.getSession(0)
		.then(function (data) {
		    free = calendar.mutualFreeTimes( busies, startTime, endTime );
		    assert.isAbove(free.length, 0, "free has something");
		    assert.equal(free.length, 1);
		    console.log(free);
		});
	});
    });
});

