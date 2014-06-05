var BOSH_SERVICE = '/http-bind';
var connection = null;

function log(msg)
{
    console.log(document.createTextNode(msg));
}

function chatMessage(user,msg) 
{
time = new Date();
$('.backlog').append("<li class='irc-message'><span class='timestamp'> "+time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds()+"</span><span class='nick'>"+ user +"</span><span class='message'>"+ msg +"</span></li>");
}

function onConnect(status)
{
    if (status == Strophe.Status.CONNECTING) {
	log('Strophe is connecting.');
    } else if (status == Strophe.Status.CONNFAIL) {
	log('Strophe failed to connect.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.DISCONNECTING) {
	log('Strophe is disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
	log('Strophe is disconnected.');
	$('#connect').get(0).value = 'connect';
    } else if (status == Strophe.Status.CONNECTED) {
	log('Strophe is connected.');
	log('ECHOBOT: Send a message to ' + connection.jid + 
	    ' to talk to me.');

	connection.addHandler(onMessage, null, 'message', null, null,  null); 
	connection.send($pres().tree());
        //connection.send($msg({to: 'deepy@im.xd.cm', type: 'chat'}).c("body").t('some data'));
    }
}
function sendMessage(to, msg) {
var message = $msg({to: to, type: 'chat'}).c("body").t(msg);
connection.send(message.tree());
chatMessage("you", msg);
}

function onMessage(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    if (type == "chat" && elems.length > 0) {
	var body = elems[0];
        chatMessage(from.split('/')[0], Strophe.getText(body));
	log('ECHOBOT: I got a message from ' + from + ': ' + 
	    Strophe.getText(body));
    
	//var reply = $msg({to: from, from: to, type: 'chat'})
        //    .cnode(Strophe.copyElement(body));
	//connection.send(reply.tree());
    }

    // we must return true to keep the handler alive.  
    // returning false would remove it after it finishes.
    return true;
}

$(document).ready(function () {
    connection = new Strophe.Connection(BOSH_SERVICE);

    // Uncomment the following lines to spy on the wire traffic.
    //connection.rawInput = function (data) { log('RECV: ' + data); };
    //connection.rawOutput = function (data) { log('SEND: ' + data); };

    // Uncomment the following line to see all the debug output.
    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };

    connection.connect(Math.random().toString(36).substr(2, 5)+"@pub.xd.cm", "", onConnect);
    $('form').submit(function (event) {
        console.log(event.target[0].value);
        sendMessage('deepy@im.xd.cm', event.target[0].value);
        event.target[0].value = "";
        return false;
    });
    $('#connect').bind('click', function () {
	var button = $('#connect').get(0);
	if (button.value == 'connect') {
	    button.value = 'disconnect';

	    connection.connect($('#jid').get(0).value,
			       $('#pass').get(0).value,
			       onConnect);
	} else {
	    button.value = 'connect';
	    connection.disconnect();
	}
    });
});
