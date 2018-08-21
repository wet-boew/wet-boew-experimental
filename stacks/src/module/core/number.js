/**
 * Number class
 * @author Government of Canada
 * @version 1.0
 */

define( function() {
	"use strict" ;

	/*
	* Returns a RFC4122 compliant Global Unique ID (GUID).
	* Originally from http://stackoverflow.com/a/2117523/455535
	*/

	function guid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function( replacementChar ) {
			let rand = Math.random() * 16 | 0,
				newChar = replacementChar === "x" ? rand : ( rand & 0x3 | 0x8 ) ;
			return newChar.toString( 16 ) ;
		} ) ;
	}

	return {
		guid: guid
	}
} ) ;
