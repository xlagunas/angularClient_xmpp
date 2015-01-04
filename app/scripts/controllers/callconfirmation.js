'use strict';

/**
 * @ngdoc function
 * @name xmppTestApp.controller:CallconfirmationCtrl
 * @description
 * # CallconfirmationCtrl
 * Controller of the xmppTestApp
 */
angular.module('xmppTestApp')
  .controller('CallConfirmationCtrl', function ($scope, $log, $modalInstance, contact, role, $timeout, xmpp, webrtc) {

    var promise;

    $scope.contact = contact;
    $scope.dial = {role: role, status: 'pending'};

    $scope.ok = function () {
        //TODO set audio to true
        webrtc.initStream(true, false, function(){
            $log.info("Stream is added and can be recovered");
            //If we are the callers, change layout and wait for answer from peer -disable ok button and set timeout callback'
            if ($scope.dial.role === "caller") {
                $scope.$apply(function() {
                    $scope.dial.status = "calling";
                    promise = $timeout(timeoutCancelDismissPopup, 50000);
                    sendStatus("request");
                });
            }
            //if we are the callees, just send the response and do whatever initialization is needed to receive data,
            // such as start camera
            else if ($scope.dial.role === "callee") {
                $scope.dial.status = "accepted";
                $timeout.cancel(promise);
                promise = $timeout(timeoutCancelRejectCall, 50000);
                $modalInstance.close(contact);
                sendStatus("accepted");
            }
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    function timeoutCancelDismissPopup() {
        console.log('canceledDismiss()');
        $modalInstance.dismiss('timeout');
    }

    //TODO send xmpp cancel msg
    function timeoutCancelRejectCall() {
        console.log('canceled-rejected');
        $modalInstance.dismiss('no-answered');
        sendStatus("unanswered");

    }

    function sendStatus(status){
        xmpp.send(contact.jid, JSON.stringify({type: status}));
    }

     $scope.$on('resolution', function(event, data){
         $log.info(data);
         $modalInstance.close(contact);
     });

  });
