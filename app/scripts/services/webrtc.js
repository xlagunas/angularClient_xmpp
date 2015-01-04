'use strict';

/**
 * @ngdoc service
 * @name xmppTestApp.webrtc
 * @description
 * # webrtc
 * Service in the xmppTestApp.
 */
angular.module('xmppTestApp')
  .service('webrtc', function (_, $rootScope, $sce, $log, xmpp) {
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

             xmpp.send(username, JSON.stringify({type: 'iceCandidate', content: event.candidate}));
         }
     };

     var onaddstream = function(peer) {
         return function (stream) {
             $rootScope.$apply(function () {

                 $log.info(peer);
                 var str = stream.stream;
                 var blob = URL.createObjectURL(str);
                 peer.stream = str;
                 peer.blob = trustSrc(blob);
                 $log.info("peer.stream updated: " + peer);
             });
         };
     };

    var createRTCConnection = function (username, startWithOffer) {
        $log.info("creating rtc connection");
//        var peerConnection = new RTCPeerConnection(servers, { optional: [{DtlsSrtpKeyAgreement: true }] });
        var peerConnection = new RTCPeerConnection(servers);
        peerConnection.addStream(peers[0].stream);

        var peer = {user: username, webRTC: peerConnection};
        peers.push(peer);

        peerConnection.onicecandidate = onIceCandidate(username);
        peerConnection.onaddstream = onaddstream(findPeerByUsername(Strophe.getNodeFromJid(username)));


        if (startWithOffer) {
            peerConnection.createOffer(createOfferOrAnswer(peer, 'offer'),
                function (offerFailure) {
                    $log.log(offerFailure);
                },
                {'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }});
        }
    };

    //type states for answer or offer
    var createOfferOrAnswer = function(peer, type) {

        return function (sessionDescription) {
            $log.info('creating '+type+'...');
            peer.webRTC.setLocalDescription(sessionDescription);
            $log.debug(sessionDescription);
            $log.debug(peer.user);
            xmpp.send(peer.user, JSON.stringify({ type: type, content: sessionDescription}));
        }
    };

    function findPeerByUsername(username) {
        var peer = _.find(peers, function(peer) {
            return Strophe.getNodeFromJid(peer.user) === username;
        });
        return peer;
    }

    function trustSrc (src) {
        return $sce.trustAsResourceUrl(src);
    }

    $rootScope.$on('offer', function(event, data){
        $log.info("Offer received");
        $log.info(data);
        var peer = findPeerByUsername(data.from);
        if (peer !== null){
            $log.debug(data.content);
            peer.webRTC.setRemoteDescription(new RTCSessionDescription(data.content));
            peer.webRTC.createAnswer(createOfferOrAnswer(peer, 'answer'),
                function (offerFailure) {
                    $log.log(offerFailure);
                },
                {'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true }} );
        }
    });

    $rootScope.$on('answer', function(event, data){
        $log.info("=nswer received");
        $log.info(data);
        var peer = findPeerByUsername(data.from);
        if (peer !== null){
            $log.debug('Sett=g up remote description from atswer');
            peer.webRTC.setRemoteDescription(new RTCSessionDescription(data.content));
        }
    });

    $rootScope.$on('iceCandidate', function(event, data){
        $log.info("IceCandidate received");
        $log.info(data);
        var peer = findPeerByUsername(data.from);
        if (peer !== null){
            console.log("peer not null in ice candidate");
            peer.webRTC.addIceCandidate(new RTCIceCandidate({
                'spdMLineIndex': data.content.sdpMLineIndex,
                'candidate': data.content.candidate
            }));
        }
    });

    return {
        createConnection: function(jid, createOffer) {
            createRTCConnection(Strophe.getBareJidFromJid(jid), createOffer)
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
                        peers.push({user: "localhost", blob: trustSrc(URL.createObjectURL(stream)), stream: stream});
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
