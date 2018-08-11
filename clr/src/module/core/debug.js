/**
 * Debug Class
 * @author Government of Canada
 * @version 1.0
 * @requires TimeUtil
 */
define( [ "module/core/time" ], function( TimeUtil ) {
	"use strict"

    /**
     * logging to console with a timestamp
     * @public
     * @param {String} message the message to produce in the console
     * @returns void
     */
	function log( message ) {
		console.log( "[ " + TimeUtil.stamp() + " ] " + message );
    }

    return {
        log : log
    }

} );
