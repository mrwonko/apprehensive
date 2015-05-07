/**
 * Wrapping the global Strophe variable in a service so it can be mocked when testing
 */
angular.module( "strophe", [] )
.factory( "strophe", function( $window, $q, $log ) {
    var Strophe = $window.Strophe;
    var $msg = $window.$msg;
    //var $build = $window.$build;
    //var $iq = $window.$iq;
    var $pres = $window.$pres;
    
    /* I'd love to delete these to force users to use the strophe service, but the library uses them itself :/
    delete( $window.Strophe );
    delete( $window.$build );
    delete( $window.$msg );
    delete( $window.$iq );
    delete( $window.$pres );
    */
    
    Strophe.log = function( level, message ) {
        if( level == Strophe.LogLevel.DEBUG ) {
            //$log.debug( "Strophe: " + message );
        } else if( level == Strophe.LogLevel.INFO ) {
            //$log.info( "Strophe: " + message );
        } else if( level == Strophe.LogLevel.WARN ) {
            $log.warn( "Strophe: " + message );
        } else if( level == Strophe.LogLevel.ERROR || level == Strophe.LogLevel.FATAL ) {
            $log.error( "Strophe: " + message );
        }
    };
    
    var strophe = {};
    var code = 0;
    // Notify events
    strophe.event = {
        "CONNECTING": ++code,
        "AUTHENTICATING": ++code,
        "CONNECTED": ++code, // sendMessage: function( to, text )
        "DISCONNECTING": ++code,
        "MESSAGE": ++code // message: { "to": "", "from": "", "content": "" }
    };
    strophe.error = {
        "ERROR": ++code,
        "CONNFAIL": ++code,
        "AUTHFAIL": ++code
    };
    strophe.connect = function( url, user, password ) {
        var deferred = $q.defer(),
            connection = new Strophe.Connection( url );
        // function user can use to send messages. Supplied in CONNECTED notification
        function sendMessage( to, message ) {
            var stanza = $msg( {
                "to": to,
                "type": "chat"
            } ).c( "body" ).t( message ).tree();
            connection.send( stanza );
            // wish I could return a promise for this, but I don't know if strophe supplies the necessary information
        }
        // callback for incoming messages. Sends MESSAGE notification
        function onMessage( message ) {
            $log.info( "message! %o", message );
            var bodies = message.getElementsByTagName( "body" );
            if( message.getAttribute( "type" ) == "chat" && bodies.length > 0 ) {
                deferred.notify( {
                    "event": strophe.event.MESSAGE,
                    "message": {
                        "to": message.getAttribute( "to" ),
                        "from": message.getAttribute( "from" ).split('/')[ 0 ],
                        "content": Strophe.getText( bodies[ 0 ] ),
                        "date": new $window.Date()
                    }
                } );
            }
            return true;
        }
        // callback for connection events. Rejects/Resolves/Notifies accordingly.
        function onEvent( status, reason ) {
            // errors
            if( status == Strophe.Status.ERROR ) {
                deferred.reject( { "error": strophe.error.ERROR, reason: "reason" } );
            } else if( status == Strophe.Status.CONNFAIL ) {
                deferred.reject( { "error": strophe.error.CONNFAIL, reason: "reason" } );
            } else if( status == Strophe.Status.AUTHFAIL ) {
                deferred.reject( { "error": strophe.error.AUTHFAIL, reason: "reason" } );
            }
            // notifications
            else if( status == Strophe.Status.CONNECTING ) {
                deferred.notify( { "event": strophe.event.CONNECTING } );
            } else if( status == Strophe.Status.AUTHENTICATING ) {
                deferred.notify( { "event": strophe.event.AUTHENTICATING } );
            } else if( status == Strophe.Status.CONNECTED ) {
                connection.send( $pres().tree() );
                deferred.notify( { "event": strophe.event.CONNECTED, "sendMessage": sendMessage } );
            } else if( status == Strophe.Status.DISCONNECTING ) {
                deferred.notify( { "event": strophe.event.DISCONNECTING } );
            }
            // completion
            else if( status == Strophe.Status.DISCONNECTED ) {
                deferred.resolve( null );
            }
        }
        
        connection.addHandler( onMessage, null, "message", null, null, null, null );
        connection.connect( user, password, onEvent );
        
        return deferred.promise;
    };
    return strophe;
} )
.run( function( strophe ) {
    // force factory to be run at startup, removing global strophe variables
} )
;
