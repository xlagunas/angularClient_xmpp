'use strict';

describe('Service: xmpp', function () {

  // load the service's module
  beforeEach(module('xmppTestApp'));

  // instantiate service
  var xmpp;
  beforeEach(inject(function (_xmpp_) {
    xmpp = _xmpp_;
  }));

  it('should do something', function () {
    expect(!!xmpp).toBe(true);
  });

});
