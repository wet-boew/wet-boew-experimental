/**
 * Barebone plugin
 * @author Government of Canada
 * @version 1.0
 * @requires
 */

define( [ "../../vendor/jsonpointer/jsonpointer" ], function( jsonPointer ) {
    "use strict";


    // Plugin init function
	function init( elm ) {

		console.log( "plugin initiated" );
	}

	
	// Public expose function
	return {
		init: init
	};
} );

