var BOSH_SERVICE = '/http-bind';
var connection = null;

function log(msg) {
	console.log(document.createTextNode(msg));
}

function chatMessage(user,msg) {
	angular.element(document.querySelector(".wrapper")).scope().log(msg, user, user)
}

function onConnect(status) {
	if (status == Strophe.Status.CONNECTING) {
		angular.element(document.querySelector(".wrapper")).scope().log("Connecting to chat server...", "System", "System")
		log('Strophe is connecting.');
	} else if (status == Strophe.Status.CONNFAIL) {
		angular.element(document.querySelector(".wrapper")).scope().log("Failed to connect to chat server", "System", "System")
		log('Strophe failed to connect.');
	} else if (status == Strophe.Status.DISCONNECTING) {
		angular.element(document.querySelector(".wrapper")).scope().log("Disconnecting from chat server...", "System", "System")
		log('Strophe is disconnecting.');
	} else if (status == Strophe.Status.DISCONNECTED) {
		angular.element(document.querySelector(".wrapper")).scope().log("Disconnected", "System", "System")
		log('Strophe is disconnected.');
	} else if (status == Strophe.Status.CONNECTED) {
		angular.element(document.querySelector(".wrapper")).scope().log("Connected", "System", "System")
		log('Strophe is connected.');
		log('ECHOBOT: Send a message to ' + connection.jid + ' to talk to me.');
		connection.addHandler(onMessage, null, 'message', null, null, null);
		connection.send($pres().tree());
	}
}

function sendMessage(to, msg) {
	var message = $msg({to: to, type: 'chat'}).c("body").t(msg);
	connection.send(message.tree());
}

function onMessage(msg) {
	var to = msg.getAttribute('to');
	var from = msg.getAttribute('from');
	var type = msg.getAttribute('type');
	var elems = msg.getElementsByTagName('body');
	if (type == "chat" && elems.length > 0) {
		var body = elems[0];
		chatMessage(from.split('/')[0], Strophe.getText(body));
		log('ECHOBOT: I got a message from ' + from + ': ' + Strophe.getText(body));
	}
	// we must return true to keep the handler alive.
	// returning false would remove it after it finishes.
	return true;
}
var agentChat = angular.module('agentChat', ['luegg.directives']);

agentChat.controller("ChatCtrl", [ "$scope", function($scope) {

	$scope.showChat = function(chat) {
		$scope.currentChat = chat;
	}
	initDate = new Date();
	$scope.chats = [
		{"name": "System",
		"topic": "System",
		"input": "",
		"updated": "false",
		"glued": "true",
		"messages": [[ ('0' + initDate.getHours()).slice(-2) + ':' + ('0' + initDate.getMinutes()).slice(-2) + ':' + ('0' + initDate.getSeconds()).slice(-2), "System", "Welcome to ..You what?!" ]]},
		{"name": "Sture",
		"topic": "AAAAAH",
		"input": "",
		"updated": "true",
		"messages": [ [ "example timestamp", "example nickname", "example message" ] ]},
		{"name": "Lure",
		"topic": "Eh",
		"input": "",
		"messages": [ [ "example timestamp", "example nickname", "example message" ] ]}
	];
	$scope.currentChat = $scope.chats[0];
	$scope.lookup = {};
	$scope.updateLookup = function() {
		for (var i = 0, len = $scope.chats.length; i < len; i++) {
			$scope.lookup[$scope.chats[i].name] = $scope.chats[i];
		}
	}
	$scope.updateLookup();
	$scope.log = function(msg, nick, window) {
		d = new Date();
		if ($scope.lookup[window]) {
			$scope.lookup[window].messages.push([ ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2), nick, msg ]);
			$scope.lookup[window].updated = "true";
		} else {
			$scope.chats.push({ "name": window, "topic": "Not implemented", "input": "", "updated": "true", "glued": "true",
				"messages": [ [ ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + 
				':' + ('0' + d.getSeconds()).slice(-2), nick, msg ] ] });
			$scope.updateLookup();
		}
		try {
			$scope.$apply();
		} catch(err) {
			//suppress
		}
	}
	$scope.inputmessage = function(window) {
		if ($scope.lookup[window].input) {
			$scope.log($scope.lookup[window].input, "You", window);
			sendMessage('deepy@im.xd.cm', $scope.lookup[window].input);
			$scope.lookup[window].input = '';
		}
	}
	
	connection = new Strophe.Connection(BOSH_SERVICE);
	// Uncomment the following lines to spy on the wire traffic.
	//connection.rawInput = function (data) { log('RECV: ' + data); };
	//connection.rawOutput = function (data) { log('SEND: ' + data); };
	// Uncomment the following line to see all the debug output.
	//Strophe.log = function (level, msg) { log('LOG: ' + msg); };
	connection.connect(Math.random().toString(36).substr(2, 5)+"@pub.xd.cm", "", onConnect);


}]);
	agentChat.directive('resizable', function($window) {
		return function($scope) {
			$scope.initializeWindowSize = function() {
			$scope.windowHeight = $window.innerHeight;
			$scope.heightCSS = { "height": $window.innerHeight - 185 + "px"};
			return $scope.windowWidth = $window.innerWidth;
		};
		$scope.initializeWindowSize();
		return angular.element($window).bind('resize', function() {
			$scope.initializeWindowSize();
			return $scope.$apply();
		});
		};
	});
