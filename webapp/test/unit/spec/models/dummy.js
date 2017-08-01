'use strict';

var Dummys = require('../../../../src/scripts/models/dummy').Dummys;

describe('dummy', function () {

    beforeEach(function () {

    });

    afterEach(function(done) {
        //TODO: cleanup if needed

        setTimeout(done);
    });

    it('collection should parse response properly', function () {
        var dummys = 'abc';
        var response = {
            dummys: dummys,
            junk: 'blah'
        };

        var collection = new Dummys();
        expect(collection.parse(response)).toBe(dummys);
    });
});
