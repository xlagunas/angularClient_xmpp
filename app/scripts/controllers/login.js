'use strict';

/**
 * @ngdoc function
 * @name xmppTestApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the xmppTestApp
 */
angular.module('xmppTestApp')
  .controller('LoginCtrl', function ($scope, xmpp, $state, webrtc) {

    $scope.loginClick = function (username, password) {
        console.log("username "+username + ", password:  "+password);
        xmpp.auth(username, password);
    };

    $scope.webrtc = webrtc;


    //TO DELETE (hardcode init user)
    $scope.user = {username: "user1", password: "123456"};

    $scope.xmppService = xmpp;

    $scope.$watch('xmppService.login', function(newVal, oldVar, scope){
        if (newVal && newVal.status !== null && newVal.status === "connected"){
            $state.go("landing");
        }
    }, true);




  });
