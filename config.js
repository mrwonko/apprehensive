"use strict";

angular.module( "apprChatConfig", [] )
.factory( "apprJabberConfig", function() {
	// feel free to generate this name randomly or whatever you need
	var user = "user@jabber.mrwonko.de";
	return {
		"name": "jabber.mrwonko.de",
		"url": "http://jabber.mrwonko.de/http-bind",
		"admin": {
			name: "moderator@jabber.mrwonko.de",
			password: "test"
		},
		"user": {
			name: user,
			password: "test"
		}
	};
} )
;