/**
 * Element Command class
 * @author Government of Canada
 * @version 1.0
 */

define( function() {
    "use strict";

	function selectors( $elm, command, index, actionid  )
	{
		let aSelector = "data-wb5-" + actionid + "-selector";

		if ( $elm.hasAttribute( "data-wb5-selector" ) )
		{
			let selector = $elm.getAttribute( "data-wb5-selector" ).split("@");
			command[index]["selector"] = ( typeof selector[index] !== 'undefined' ) ? selector[index] : false;
		}

		if ($elm.hasAttribute( aSelector ) )
		{
			command[index]["selector"] = $elm.getAttribute( aSelector );
		}

		return command;
	}

	function options( $elm, command, index, actionid  )
	{
		let aOptions = "data-wb5-" + actionid + "-options";

		if ( $elm.hasAttribute( "data-wb5-options" ) )
		{
			let options = $elm.getAttribute( "data-wb5-options" ).split("@");
			command[index]["options"] = ( typeof options[index] !== 'undefined' ) ? JSON.parse( options[index] ) : false;
		}

		if ($elm.hasAttribute( aOptions ) )
		{
			command[index]["options"] = JSON.parse( $elm.getAttribute( aOptions ) ) ;
		}

		return command;
	}
    /**
     * inspect the data-wb5 attribute for action stack
     * @public
     * @param {String} attr the attribute text
     * @returns action object
     * @type Object
     */

	function inspect( $elm ) {
		let actions = $elm.getAttribute("data-wb5").split(" "),
			commands = [];

		// IE has a known issue with for looping and scope of let bound variable
		// - workaround - use 'var' for loops
		for (let i = 0; i < actions.length; i++) {
			let action = actions[i];

			if ( typeof commands[i] === 'undefined' )
			{
				commands[i] = { command : action, selector : false, options : false };
			}

			commands = selectors( $elm, commands, i, action);
			commands = options( $elm, commands, i, action);
			// Lets explore options
		}
		return commands;
    }


	return {
		inspect: inspect
	};
} );
