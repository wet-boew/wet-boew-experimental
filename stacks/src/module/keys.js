/**
* keys.js - allow navigation through lists with the keyboard
* @returns {void}
*/
define( [ "module/core/object", "module/element", "module/event" ], function( ObjectUtil , ElementUtil, EventUtil) {
	
	/**
	* keycode - determines what action to take when a key is pressed
	* @private
	* @param {object} event the event object to which the user "clicked" the element
	* @param {string} orientation - whether the menu is horizontal or vertical (navigated with left/right or up/down)
	* @returns a number representing an action to take
	* @type int
	*/
	
	function keycode( event, orientation ) {
		
		let code = event.charCode || event.keyCode;
		if (orientation == "horizontal"){
			if (code == 39){ //right arrow
				return 1
			}
			if (code == 37){ //left arrow
				return -1
			}
			if (code == 40){ //down arrow
				return 2
			}
		}
		else{
			if (code == 40){ //down arrow
				return 1
			}
			if (code == 38){ //up arrow
				return -1
			}
			if (code == 39){ //right arrow
				return 2
			}
		}
		if(code == 9) return code;
		return false;
	}
	
	function find( $children, classname )
	{
		for (let idx = $children.length - 1; idx >= 0; idx--) {
			
			if ( ElementUtil.hasClass( $children[idx], classname) )
			{
				return idx
			}
		}
		return -1;
	}
	
	function handle( $elm, selector, options ) {
		
		let properties = Object.assign({ eventname: "keypress", classname: "open", orientation: "horizontal" }, options ),
		children = ElementUtil.nodes( $elm, selector );
		
		ElementUtil.addListener( $elm, properties.eventname, function( event ){
			let key = keycode(event, properties.orientation);
			if (!key){
				return;
			}
			/*else if (key == 9){
				for (let node of children){
					ElementUtil.removeClass( node, properties.classname );
				}
			}*/
			
			let advance = key
			current = find( children, properties.classname ),
			total = children.length,
			next = 0;
			
			if (key == -1 || key == 1){
				if ( current + advance < total )
				{
					next = current + advance;
					next = ( next < 0 ) ? total + next : next;
				}
				
				if ( current + advance > total )
				{
					next = current + advance;
					next = ( next > total ) ? total - next : next;
				}
				
				children[next].firstChild.focus()
			}
			//else if (key == 2){
			//	let c = children[current].querySelector(".sm > li > a");
			//	ElementUtil.addClass(c, "active");
			//	c.focus()
			//}
		});
		
	}
	
	return {
		handle: handle
	};
} );


















































