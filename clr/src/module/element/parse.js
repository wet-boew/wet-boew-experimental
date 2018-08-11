/**
 * Element Command class
 * @author Government of Canada
 * @version 1.0
 */

define( function() {
    "use strict";

    function _short( attr )
    {
    	let segements = attr.split("@"),
    		action = new Array(3);

    	for (let idx = 0; idx < segements.length; idx++)
    	{
    		if ( idx == 0 )
    		{
    			action[0]( segements[idx]);
    			continue;
    		}

    		if ( segements[idx].startsWith("{") )
    		{
    		    action[2] = JSON.parse( segements[idx] );
    		    continue;
    		}
		
			   action[1] = segements[idx];		

    	}
    	return action;

    }

    /**
     * inspect the data-wb5 attribute for action stack
     * @public
     * @param {String} attr the attribute text
     * @returns action object
     * @type Object
     */

	function parse( $elm ) {
		/**
		 * data-wb5 can allow : 
		 *  - shorthand "action@selector@options"
		 *  - multiple "action action"
		 */
		let attr = $elm.getAttribute("data-wb5"),
			shorthand = ( attr.indexOf("@") > -1 ) ? true : false;


		if ( shorthand )
		{
			return _short( attr );
		}

    }


	return parse
} );
