/**
 * timer.js - a timer module that will create a repetative timer on an element
 * @returns {void}
 */
define( [ "module/core/object", "module/element" ], function( ObjectUtil , ElementUtil) {

	  function a11yClick( event ) {

		if ( event.type === "click" ) {
	        return true;
        }

        if ( event.type === "keypress" ) {

	        let code = event.charCode || event.keyCode;

			if ( ( code === 32 ) || ( code === 13 ) ) {
	            return true;
	        }
	    }

        return false;
	}

	function handle( $elm, selector, options ) {

        let properties = Object.assign({ func: "show" }, options ),
            children = ElementUtil.nodes( $elm, selector );


		ElementUtil.addListener( $elm, "click keypress",function( event ){
	        	if ( a11yClick( event ) )
	        	{
	        		for(let i = 0, length = children.length; i < length; i++){
	        			console.log( children[i] );
	        			children[i][ properties.func ]();
	        		}
	        	}
        	});

	}

	return {
		handle: handle
	};
} );
