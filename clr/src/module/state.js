/**
 * state.js - a state module that depicts state via classes on a suite or single UI element
 * @returns {void}
 */
define( [ "module/element" ], function( wbElement ) {

	function choose( $children, findx, classname )
	{
        for (let idx = $children.length - 1; idx >= 0; idx--) {

			if ( wbElement.hasClass( $children[idx], findx ) )
			{

				wbElement.addClass( $children[idx], classname );
				continue;
			}

			wbElement.removeClass( $children[idx], classname );
        }
	}


	function handle( $elm, selector, options ) {

        let properties = Object.assign({  eventname: {}, classname: "sr-only" }, options ),
            children = wbElement.nodes( $elm, selector ),
			eventlabels = Object.keys(properties.eventname).join(" ");

        wbElement.addListener( $elm, eventlabels ,function( event ){
			return choose( children, properties.eventname[event.type], properties.classname );
        });

	}

	return {
		handle: handle
	};
} );
