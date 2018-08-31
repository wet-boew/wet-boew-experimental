/**
 * Element class
 * @author Government of Canada
 * @version 1.0
 */

define( ["module/element/store", "module/element/classes", "module/element/command" ], function( wbStorage, wbClassList, wbCommand ) {
	"use strict";


    function store( $elm, key, value ){
        return wbStorage.bless( $elm, key, value);
    }


    /**
     * take the selector node and queries again DOM
     * @public
     * @param {DOMElement} node the context node
     * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
     * @returns Describe what it returns
     * @type String|Object|Array|Boolean|Number
     */

	function nodes( node, selector ) {
		if ( selector == null || selector == '' ) {
			return [ node ];
		}

		let context = ( selector && selector.startsWith( "#" ) ) ? document : node;

        // run the query against the required context
		return context.querySelectorAll( selector );
	}

	/**
	 * Creates a STYLE element with the specified content.
	 * @param  {string} content  The stylesheet content.
	 * @return {!Element}  The created STYLE element.
	 */
	function stylesheet( content ) {
	    var style = document.createElement('style');
	    var styleSheet = style.styleSheet;
	    if (styleSheet) {
	        styleSheet.cssText = content;
	    }
	    else {
	        style.appendChild( document.createTextNode( content ) );
	    }
	    style.type = 'text/css';
	    return style;
	}

	/**
	* Add one or more listeners to an element
	* @public
	* @param {Object} $elm - DOM element to add listeners to
	* @param {String} names - space separated list of event names, e.g. 'click change'
	* @param {Function} listener - function to attach for each event as a listener
	*/
	function addListener( $elm, names, listener ) {

		let events = names.split( " " );

		for ( let evnt of events)
		{
			$elm.addEventListener( evnt, listener, false );
		}
    }


	function css( css )
	{
		return stylesheet( css );
	}


    return {
        inspect: wbCommand.inspect,
		nodes: nodes,
		css: css,
        toggle: wbClassList.toggle,
        store: store,
		addClass: wbClassList.add,
		hasClass: wbClassList.has,
		removeClass: wbClassList.remove,
		addListener: addListener
    };
} );
