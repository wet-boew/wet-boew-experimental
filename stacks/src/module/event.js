/**
 * Event class
 * @author Government of Canada
 * @version 1.0
 */

define( ["module/core/object"], function( ObjectUtil ) {
	"use strict"

	function create( event, params ) {
		let _params = Object.assign({ bubbles: true, cancelable: false, detail: undefined }, params ),
		    evt = document.createEvent( "CustomEvent" );

		evt.initCustomEvent( event, _params.bubbles, _params.cancelable, _params.detail );

		return evt;
	}

    function multiple( events, params)
    {
        let multi = [];
        for ( let evt of events.split(" ") )
        {
            multi.push( create( evt, params ) );
        }
        return multi;
    }

	return {
		create: create,
        multiple: multiple
	}
} );
