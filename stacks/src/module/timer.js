/**
 * Timer class - a programmable timer
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( [ "module/event", "module/element" ], function( EventUtil, ElementUtil ) {
    "use strict";

    function prime( $elm ) {
        ElementUtil.addListener( $elm, "stop", function( event ) {
            ElementUtil.store( $elm, "timer.state", "off" );
        } );

        ElementUtil.addListener( $elm, "start", function( event ) {
            ElementUtil.store( $elm, "timer.state", "on"  );
        } );

        return $elm;
    }

	function handle( $elm, selector, options ) {

        let properties = Object.assign({ eventname: "timerpoke", speed: 3 }, options );

        $elm = prime( $elm );

		for ( let $node of ElementUtil.nodes( $elm, selector ) ) {

			let tid = setInterval( function( event, node ) {

                if ( ElementUtil.store( $elm, "timer.state" ) !== "off"  && !document.hidden ) {
                    node.dispatchEvent( event );
                }
	        }, properties.speed * 1000, EventUtil.create( properties.eventname ), $node );

		}

	}

	return {
		handle: handle
	};
} );
