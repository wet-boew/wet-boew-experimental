/**
 * Classlist class
 * @author Government of Canada
 * @version 1.0
 */

define( function() {
    "use strict";

	function isArrayLike( o ) {
	    if ( o &&                                // o is not null, undefined, etc.
	        typeof o === "object" &&            // o is an object
	        isFinite( o.length ) &&               // o.length is a finite number
	        o.length >= 0 &&                    // o.length is non-negative
	        o.length === Math.floor( o.length ) &&  // o.length is an integer
	        o.length < 4294967296 ) {
			return true;
			}

	        return false;                       // Otherwise it is not
	}

    /**
     * toggle a class on an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname the class to toggle with
     * @returns void
     */

    function toggle( $elm, classname ) {
        $elm.classList.toggle( classname );
    }

    /**
     * add a class to an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname add
     * @returns void
     */

    function add( $elm, classname ) {
		if ( !has( $elm, classname ) ) {
			$elm.classList.add( classname );
		}
    }

    /**
     * removes a class to an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname to remove
     * @returns void
     */

    function remove( $elm, classname ) {
		if ( has( $elm, classname ) ) {
			$elm.classList.remove( classname );
		}
    }

	/**
	* check if an element has a classname
	* @private
	* @param {DOMElement) $elm DOM element to inspect
	* @param {String) classname the classname to check for
	* @returns true or false
	* @type Boolean
	*/

	function has( $elm, classname ) {
		return $elm.classList.contains( classname );
	}

	/**
	 * insures that all elements are arrays
	 * @private
	 * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
	 * @returns Describe what it returns
	 * @type String|Object|Array|Boolean|Number
	 */

	function arrayify( $elm, func, classname ) {
		if ( !isArrayLike( $elm ) ) {
			$elm =  [ $elm ];
		}

		for ( let i = $elm.length - 1; i >= 0; i-- ) {
			func( $elm[ i ], classname );
		}
	}

	return {
		toggle: function( elm, classname ) { arrayify( elm, toggle, classname ) },
		add: function( elm, classname ) { arrayify( elm, add, classname ) },
		has: has,
		remove: function( elm, classname ) { arrayify( elm, remove, classname ) }
	};
});
