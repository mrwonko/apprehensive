"use strict";

angular.module( "apprChat", [ "apprChatConfig", "strophe", "lodash", "ngSanitize" ] )
.filter( 'count', function( $window, _ ) {
    return function( input ) {
        return _.size( input );
    };
} )
.factory( "apprOnStropheError", function( $log, strophe ) {
    return function( scope, url ) {
        return ;
    };
} )
.factory( "apprStropheHandler", function( $log, strophe ) {
    return function( scope, url ) {
        // common BOSH callbacks of Admin and User chat
        return {
            "onDisconnected": function() {
                $log.info( "Disconnected from " + url );
                scope.status = "disconnected";
                scope.sendMessage = null;
            },
            "onError": function( error ) {
                if( error.error == strophe.error.ERROR ) {
                    $log.error( "strophe error: " + error.reason );
                    scope.error = "Strophe error " + error.reason + "!";
                } else if( error.error == strophe.error.CONNFAIL ) {
                    $log.error( "Could not connect to " + url + ": " + error.reason );
                    scope.error = "Could not connect!";
                } else if( error.error == strophe.error.AUTHFAIL ) {
                    $log.error( "Auth rejected: " + error.reason );
                    scope.error = "Auth rejected!";
                } else {
                    $log.error( "Unknown error: %o", error );
                    scope.error = "Unknown error!";
                }
                scope.status = "error";
            }
        };
    };
} )
.directive( "apprChat", function() {
    return {
        scope: {
            "sendMessage": "=",
            "messages": "="
        },
        templateUrl: "templates/chat.html",
        restrict: 'E'
    };
} )
.directive( "apprAdminChat", function() {
    return {
        "scope": {},
        "restrict": 'E', // element directive (i.e. a new tag)
        "templateUrl": 'templates/adminchat.html',
        "controller": function( $scope, apprJabberConfig, strophe, $log, $window, apprStropheHandler, _ ) {
            var config = apprJabberConfig;
            
            $scope.status = "connecting";
            $scope.tabs = [];
            $scope.messagesByUser = {};
            $scope.updated = {};
            $scope.network = config.name;
            $scope.currentTab = null;
            $scope.changeTab = function( tab ) {
                 $scope.currentTab = tab;
                 tab.updated = false;
            };
            $scope.closeTab = function( tab ) {
                $scope.tabs.splice( $scope.tabs.indexOf( tab ), 1 );
                // closed the current tab?
                if( $scope.currentTab == tab ) {
                    $scope.currentTab = $scope.tabs == 0 ? null : $scope.tabs[ 0 ];
                }
            };
            
            // BOSH callbacks
            function onNotification( notification ) {
                if( notification.event == strophe.event.CONNECTED ) {
                    $log.info( "Admin connected to " + config.url );
                    $scope.status = "connected";
                    //    define SendMessage
                    var sendMessage = notification.sendMessage;
                    $scope.sendMessage = function( message ) {
                        $log.info( "Admin sending message to " + $scope.currentTab.user + ": " + message );
                        sendMessage( $scope.currentTab.user, message );
                        message.replace( "<", "&lt;" );
                        $scope.messagesByUser[ $scope.currentTab.user ].push( {
                            "from": "you",
                            "content": message.replace( /</g, "&lt;").replace( />/g, "&gt;" ),
                            "date": new $window.Date()
                        } );
                    };
                } else if( notification.event == strophe.event.DISCONNECTING ) {
                    $log.info( "Admin disconnecting from " + config.url );
                    $scope.sendMessage = null;
                    $scope.status = "disconnecting";
                }
                //    New Message
                else if( notification.event == strophe.event.MESSAGE ) {
                    var message = notification.message,
                        from = message.from;
                    // create message list for this user, if necessary
                    if( !$scope.messagesByUser.hasOwnProperty( from  ) ) {
                        $scope.messagesByUser[ from ] = [];
                    }
                    var tab = _.find( $scope.tabs, { "user": from } );
                    // open tab for this user, if necessary
                    if( _.isUndefined( tab ) ) {
                        tab = { "user": from, "updated": false };
                        $scope.tabs.push( tab );
                        // if this is the first tab, make it the current one
                        if( !$scope.currentTab ) {
                            $scope.currentTab = tab;
                        }
                    }
                    // mark tab as updated, unless current
                    if( from != $scope.currentTab.user ) {
                        tab.updated = true;
                    }
                    $scope.messagesByUser[ from ].push( message );
                }
            }
            
            var stropheHandler = apprStropheHandler( $scope, config.url );
            strophe.connect( config.url, config.admin.name, config.admin.password )
                .then( stropheHandler.onDisconnected, stropheHandler.onError, onNotification );
        }
    };
} )
.directive( "apprUserChat", function() {
    return {
        "scope": {},
        "restrict": 'E', // element directive (i.e. a new tag)
        "templateUrl": 'templates/userchat.html',
        "controller": function( $scope, apprJabberConfig, strophe, $log, $window, apprStropheHandler ) {
            var config = apprJabberConfig;
            
            $scope.status = "connecting";
            $scope.messages = [];
            
            // BOSH callbacks
            function onNotification( notification ) {
                if( notification.event == strophe.event.CONNECTED ) {
                    $log.info( "User connected to " + config.url );
                    $scope.status = "connected";
                    var sendMessage = notification.sendMessage;
                    $scope.sendMessage = function( message ) {
                        $log.info( "User sending message: " + message );
                        sendMessage( config.admin.name, message );
                        $scope.messages.push( {
                            "from": "you",
                            "content": message.replace( /</g, "&lt;").replace( />/g, "&gt;" ),
                            "date": new $window.Date()
                        } );
                    };
                } else if( notification.event == strophe.event.DISCONNECTING ) {
                    $log.info( "Admin disconnecting from " + config.url );
                    $scope.sendMessage = null;
                    $scope.status = "disconnecting";
                } else if( notification.event == strophe.event.MESSAGE ) {
                    $scope.messages.push( notification.message );
                }
            }
            
            var stropheHandler = apprStropheHandler( $scope, config.url );
            strophe.connect( config.url, config.user.name, config.user.password )
                .then( stropheHandler.onDisconnected, stropheHandler.onError, onNotification );
        }
    };
} )
;
