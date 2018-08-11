/**
 * Emit class - a programmable casting event function
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( [ "module/event", "module/element", "module/gears" ], function( EventUtil, ElementUtil, Gears ) {
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

        let props = Object.assign({ events: [ "timerpoke" ], listener: "click keypress" }, options );

        // If this is automated - prime the element
        if ( props.repeat )
        {
            prime( $elm );

            for ( let $node of ElementUtil.nodes( $elm, selector ) ) {

            var tid = setInterval( function( events, node, opts ) {
                //console.log(event);
                if ( ElementUtil.store( $elm, "timer.state" ) !== "off"  && !document.hidden ) {
                    for (var i = 0; i < events.length; i++) {
                        Gears[events[i]]( node, opts );
                    }
                    //Gears[event.type]( node, opts );
                    }
                }, props.repeat * 1000, props.events, $node, options );

            }

            return true;
        }

        ElementUtil.addListener(  $elm, props.listener , function( evnt ) {
    		for ( let $node of ElementUtil.nodes( $elm, selector ) ) {
                for (let evt of events )
                {
                    Gears[event.type ]( node, options );
                }
    		}
        });

	}

	return {
		handle: handle
	};
} );
