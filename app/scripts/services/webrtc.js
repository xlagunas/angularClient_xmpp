'use strict';

/**
 * @ngdoc service
 * @name xmppTestApp.webrtc
 * @description
 * # webrtc
 * Service in the xmppTestApp.
 */
angular.module('xmppTestApp')
  .service('webrtc', function (_, $rootScope, $sce, xmpp) {
    var servers = {
        'iceServers': [
            {'url': 'stun:stun.l.google.com:19302'},
            {'url': 'stun:stun1.l.google.com:19302'},
            {'url': 'stun:stun2.l.google.com:19302'},
            {'url': 'stun:stun3.l.google.com:19302'},
            {'url': 'stun:stun4.l.google.com:19302'}
        ]
    };

    var peers = [];

     var onIceCandidate = function (username) {
         return function (event) {
             if (!event || !event.candidate) {
                 return event;
             }

             $log.info('Sending Ice Candidate to ' + username);

             xmpp.send(username, {type: 'iceCandidate', candidate: event.candidate});
         }
     };

    var createRTCConnection = function (username) {

        var peerConnection = new RTCPeerConnection(servers, { optional: [{DtlsSrtpKeyAgreement: true }] });
        peerConnection.onIceCandidate = onIceCandidate(username);
        peerConnection.addStream(peers[0].stream);

        var peer = {user: username, webRTC: peerConnection};


    };

    function trustSrc (src) {
        return $sce.trustAsResourceUrl(src);
    }

    return {
        addPeer: function(jid) {
            peers.add(jid);
        },
        //video and audio are booleans
        initStream: function(video, audio, callback){
            var constraints = {
                audio: audio,
                video: video
            };
            requestUserMedia(constraints)
                .then(function(stream){
                    console.log("Exit amb l'stream");
//                    localStream = stream;
                    return stream;
                })
                .then(function(stream){
                    $rootScope.$apply(function() {
                        peers.push({user: "localhost", stream: trustSrc(URL.createObjectURL(stream))});
                    });
                }).then(callback)
                .catch(function(error){
                    console.log("eror amb l'stream");
                    console.log(error);
                });
        },

        getPeers : peers
    }
  });
