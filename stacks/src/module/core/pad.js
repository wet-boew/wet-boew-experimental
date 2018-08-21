/**
 * Pad class
 * @author Government of Canada
 * @version 1.0
 */

define( function() {
    "use strict" ;

	function start( text, targetLength, padString ) {

        text = "" + text ;

		if ( !padString || text.length >= targetLength ) {
            return text ;
          }
          let max = ( targetLength - text.length ) / padString.length ;
          for ( let i = 0 ;i < max ;i++ ) {
            text = padString + text ;
          }
          return text ;
	}

	function end( text, targetLength, padString ) {

        text = "" + text ;

		if ( !padString || text.length >= targetLength ) {
            return text ;
          }
          let max = ( targetLength - text.length ) / padString.length ;
          for ( let i = 0 ;i < max ;i++ ) {
            text += padString ;
          }

          return text ;
	}


	return {
		start: start,
		end: end
	} ;
} ) ;
