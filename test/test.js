var assert = require('chai').assert;
var calendar = require('../modules/calendar.js');
require("datejs");

describe('Calendar', function() {
    describe('#mutualFreeTimes()', function () {
	it('should return 0 when no freetimes', function () {
	    var busies = [ 
		{ start : "2016-04-13T07:00:00Z", end : '2016-04-13T09:00:00Z' }
	    ]
	    var startTime = '2016-04-13T06:00:00Z';
	    var endTime = '2016-04-13T11:00:00Z';

	    var meh = Date.parse(startTime);
	    console.log(meh.toString());

	    var free = calendar.mutualFreeTimes( busies, startTime, endTime );
	    console.log(free);
	    assert.isAbove(free.length, 0, "free has something");
	});
    });
});
