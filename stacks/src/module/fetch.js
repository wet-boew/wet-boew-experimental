/**
 * Fetch class - a content element replace with fetched content
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( [ "module/element", "module/aria", "module/core/object", "module/event", "mustache" ], function( ElementUtil, AriaUtil, ObjectUtil, EventUtil, Mustache ) {
    "use strict";

    function template( $elm ) {
        return $elm.querySelector( "template" ).innerHTML || false ;
    }

	function handle( $elm, selector, options ) {

        let properties = Object.assign({ eventname: "fetched" }, options ),
            event = EventUtil.create( properties.eventname, { detail: properties } );

		for ( let $node of ElementUtil.nodes( $elm, selector ) ) {

            // lets make sure that we have the aria live attribute
            AriaUtil.add( $node, "live", "polite" );

            // lets check if there is a template
            let _template = template( $elm );


            fetch( properties.url ).then( function( response ) {
              return response.json();
            } ).then( function( body ) {
                $node.innerHTML = ( _template )  ? Mustache.render( _template, body ) : body;
                $node.dispatchEvent( event );
            } );
		}

	}

	return {
		handle: handle
	};
} );
