'use strict';

/**
 * @ngdoc function
 * @name xmppTestApp.controller:LandingCtrl
 * @description
 * # LandingCtrl
 * Controller of the xmppTestApp
 */
angular.module('xmppTestApp')
  .controller('LandingCtrl', function ($scope, $log, xmpp, $state, $modal, webrtc) {

    $scope.xmppService = xmpp;
    $scope.webrtc = webrtc;

    $scope.initRoster = function(){
        xmpp.init();
    };

    if (xmpp.login.status === null){
        $state.go('login')
    } else {
        $scope.initRoster();
    }

    $scope.open = function (contact, size) {

        var modalInstance = $modal.open({
            templateUrl: '../../views/call-confirmation.html',
            controller: 'CallConfirmationCtrl',
            size: size,
            resolve: {
                contact: function () {
                    return contact;
                },
                role: function () {
                    return "caller";
                }

            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
            webrtc.createConnection(selectedItem.jid, true);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.$watch('xmppService.ringing', function(newValue, oldValue, scope){
        console.log(newValue);
        if (newValue.status === true && oldValue.status !== newValue.status) {
            var modalInstance = $modal.open({
                templateUrl: '../../views/call-confirmation.html',
                controller: 'CallConfirmationCtrl',
                resolve: {
                    contact: function () {
                        return newValue.from;
                    },
                    role: function () {
                        return "callee";
                    }
                }
            });

            modalInstance.result.then(function(contact){
                $log.debug("createing passive peer, waiting for answer");
                webrtc.createConnection(contact.jid, false);
            });
        }
    }, true);





    });
