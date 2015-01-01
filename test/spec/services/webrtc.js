'use strict';

describe('Service: webrtc', function () {

  // load the service's module
  beforeEach(module('xmppTestApp'));

  // instantiate service
  var webrtc;
  beforeEach(inject(function (_webrtc_) {
    webrtc = _webrtc_;
  }));

  it('should do something', function () {
    expect(!!webrtc).toBe(true);
  });

});
