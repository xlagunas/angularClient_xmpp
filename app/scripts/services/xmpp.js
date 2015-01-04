'use strict';


angular.module('xmppTestApp')
  .service('xmpp', function ($rootScope, _, $log) {

//        var connection = new Strophe.Connection("http://xmpp.local/http-bind");
        var connection = new Strophe.Connection("http://xmpp.xlagunas.cat");

        var users = [];
        var loginState = {};
        var ringing = {};

        ringing.status = false;

        function on_presence(presence) {

            var user = presence.getAttribute("from");
            var userNode = Strophe.getNodeFromJid(user);

            var u = _.find(users, function(existingUser){
                console.log(existingUser.username);
                return existingUser.username === userNode;
            });

            if (u != null) {
                $rootScope.$apply(function(){
                    console.log(u);
                    var unavailableNode = presence.getAttribute("type");

                    if (unavailableNode !== null && unavailableNode === "unavailable"){
                        u.status = "disconnected";
                        return true;
                    }

                    var showNode = presence.getElementsByTagName("show");
                    if (showNode.item(0) !== null) {
                        console.log(showNode[0].textContent);
                        u.status = showNode[0].textContent;
                        return true;
                    } else {
                        u.status = "available";
                        return true;
                    }
                });
            }

            return true;
        }

        function on_message(message) {
            $rootScope.$apply(function(){
                console.log("onMessage");
                $log.info(message);

                var msg = JSON.parse(message.getElementsByTagName("body").item(0).textContent);
                var sender = message.getAttribute("from");
                var username = Strophe.getNodeFromJid(sender);

                if (msg.type === "request"){
                    console.log("receive ring message");
                    ringing.status =  true;
                    var contact = _.find(users, function(user){
                        return user.username === username;
                    });
                    ringing.from = contact;
                }
                else if (msg.type === "accepted"){
                    ringing.resolution = 'accepted';
                    $rootScope.$broadcast('resolution', {resolution: true});
                }
                else if (msg.type === "rejected"){
                    console.log("Rejected call");
                    ringing.resolution = 'rejected';
                }
                else if (msg.type === "unaswered"){
                    console.log("didn't answer");
                    ringing.resolution = 'unanswered';
                }
                else if (msg.type === "offer" || msg.type == "answer"){
                    $rootScope.$broadcast(msg.type, {content: msg.content, from: username})

                }
                else if (msg.type == 'answer'){
                    $rootScope.$broadcast('offer', {content: msg.content, from: username})
                }
                else if (msg.type == 'iceCandidate'){
                    $rootScope.$broadcast('iceCandidate', {content: msg.content, from: username})
                }
            });

            return true;
        }

        function on_roster(iq) {
            $rootScope.$apply(function() {
                users.length = 0;
                Strophe.forEachChild(iq.getElementsByTagName("query")[0], "item", parse_roster_contact);
                return true;
            });
        }

        function on_roster_changed(data) {
            console.log(data);
            return true;
        }

        function parse_roster_contact (contact) {

            var newUsers = [];
            var user = {};
            user.jid = contact.getAttribute("jid");
            user.username = Strophe.getNodeFromJid(user.jid);
            user.name = contact.getAttribute("name");
            user.status = "disconnected";

            newUsers.push(user);
            users.push.apply(users, newUsers);
            console.log(users);
        }

        return {
            auth: function(login, password) {
                connection.connect(login +"@xlagunas.cat", password, function (status) {
                    if (status === Strophe.Status.CONNECTED) {
                        $rootScope.$apply(function() {
                            console.log("Connected");
                            loginState.status = "connected";
                            connection.addHandler(on_message, null, "message", "chat");
                            connection.addHandler(on_presence, null, "presence");
                            connection.addHandler(on_roster_changed, "jabber:iq:roster", "iq", "set");

                        });
                    }

                    switch (Number(status)) {
                        case Strophe.Status.ERROR:	//An error has occurred
                            console.log("Status.ERROR!");
                            break;

                        case Strophe.Status.CONNECTING:	//The connection is currently being made
                            console.log("Status.CONNECTING!");
                            break;

                        case Strophe.Status.CONNFAIL:	//The connection attempt failed
                            console.log("Status.CONNFAIL!");
                            break;

                        case Strophe.Status.AUTHENTICATING:	//The connection is authenticating
                            console.log("Status.AUTHENTICATING!");
                            break;

                        case Strophe.Status.AUTHFAIL:	//The authentication attempt failed
                            console.log("Status.AUTHFAIL!");
                            break;

                        case Strophe.Status.DISCONNECTED:	//The connection has been terminated
                            console.log("Status.DISCONNECTED!");
                            break;

                        case Strophe.Status.DISCONNECTING:	//The connection is currently being terminated
                            console.log(" Status.DISCONNECTING!");
                            break;

                        case Strophe.Status.ATTACHED:	//The connection has been attache
                            console.log("Status.ATTACHED!");
                            break;
                    }
                });
            },
            roster:  users,
            init: function () {
                var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
                        connection.sendIQ(iq, on_roster);
                        connection.send($pres().tree());
            },
            login: loginState,
            send: function(to, text) {
                var message = $msg({
                    to: to,
                    from: connection.jid,
                    type: "chat"
                }).c("body").t(text);
                $log.info(message.toString());
                connection.send(message.tree());
            },
            ringing: ringing
        }
  });


