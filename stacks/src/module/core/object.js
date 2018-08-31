/**
 * Object class
 * @author Government of Canada
 * @version 1.0
 */

define( [], function() {
	"use strict" ;

	/**
	 * extend
	 * @public
	 * @param {[]Objects} args[] and array of objects to merge
	 * @returns the merged object
	 * @type Object
	 */

    function extend() {

        for ( let i = 1 ;i < arguments.length ;i++ ) {

            for ( let key in arguments[ i ] ) {
                if ( arguments[ i ].hasOwnProperty( key ) ) {
                    arguments[ 0 ][ key ] = arguments[ i ][ key ] ;
                }
            }
        }
        return arguments[ 0 ] ;

    }

    /**
     * get an object properties with a default property if not found
     * @public
     * @param {Object} object the object to search
     * @param {String} prop the property name to search
     * @param {String|Object} default value to use if none found
     * @returns the value of the object or the default provided
     * @type {String|Object}
     */

    function _get( object, prop, _default )
    {
        if ( object && object.hasOwnProperty( prop ) )
        {
            return object[prop]
        }
        return _default
    }

	return {
		extend: extend,
        get: _get
	} ;
} ) ;
