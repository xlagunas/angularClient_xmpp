'use strict';

/**
 * @ngdoc function
 * @name xmppTestApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the xmppTestApp
 */
angular.module('xmppTestApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
