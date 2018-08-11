/**
 * Element Facade class
 * @author Government of Canada
 * @version 1.0
 */

define( ["module/element/store", "module/element/classes", "module/element/command" ], function( wbStorage, wbClassList, wbCommand ) {
	"use strict";

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


    return {
        parse: wbCommand.inspect,
		nodes: nodes,
        toggle: wbClassList.toggle,
        store: wbStorage.bless,
		addClass: wbClassList.add,
		hasClass: wbClassList.has,
		removeClass: wbClassList.remove,
		addListener: addListener
    };
} );
