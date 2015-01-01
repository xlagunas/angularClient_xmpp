'use strict';

describe('Controller: CallconfirmationCtrl', function () {

  // load the controller's module
  beforeEach(module('xmppTestApp'));

  var CallconfirmationCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CallconfirmationCtrl = $controller('CallconfirmationCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
