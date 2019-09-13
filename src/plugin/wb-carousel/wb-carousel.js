/**
 * Carousel class - a content element replace with fetched content
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( [ ], function( ) {
    "use strict";

	function init( node ) {
        console.log( "I AM IN THE CAROUSEL");
        node.innerHTML = "HELL0!"
	}

	return {
		init: init
	};
} );