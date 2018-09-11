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
		if(code == 9){
			return 'tab';
		}
		if(code == 27){
			return 'esc';
		}
		if (orientation == "horizontal"){
			if (code == 39){ //right arrow
				return 'increment';
			}
			if (code == 37){ //left arrow
				return 'decrement';
			}
			if (code == 40){ //down arrow
				return 'enter';
			}
		}
		else{
			if (code == 40){ //down arrow
				return 'increment';
			}
			if (code == 38){ //up arrow
				return 'decrement';
			}
			if (code == 39){ //right arrow
				return 'enter';
			}
		}
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
		
		let properties = Object.assign({ eventname: "keypress", classes: "open active" }, options ),
		children = ElementUtil.nodes( $elm, selector );
		//properties.classes += "active"
		listen($elm, properties, "horizontal")
		for( let child of children){
			listen(child, properties)
		}
	}

	function listen($elm, properties, orientation="vertical"){

		//console.log("attaching listener on", $elm.localName, $elm.classList)
		let children = $elm.children;

		ElementUtil.addListener( $elm, properties.eventname, function( event ){
			let advance,
			current = find( children, "active" ),
			total = children.length,
			next = 0,
			key = keycode(event, orientation);
			

			//console.log("Event logged: ", $elm)
			//console.log("Key Pressed: ", event.keyCode, ", ", key)


			if (!key){
				return;
			}
			if (key == 'tab'){
				for (let node of children){
					ElementUtil.removeClass( node, properties.classes );
				}
			}
			else if (key == 'esc'){
				ElementUtil.removeClass(children[current], "open")
				children[current].focus();
			}
			else {
				event.preventDefault()
				if (key == 'enter'){
					let c = children[current].querySelector("ul");
					if (c){
						c = c.querySelector("li > a");
						//console.log(document.activeElement)
						c.focus()
						ElementUtil.addClass(children[current], properties.classes);
						c.focus()
						//console.log(document.activeElement)
						event.stopPropagation()
					}
				}
				else if (key == 'increment' || key == 'decrement'){
					//console.log("Moving focus and adding class",properties.classes)
					advance = (key == 'increment') ? 1 : -1;
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
					if(current > -1){
						ElementUtil.removeClass(children[current], properties.classes)
					}
					ElementUtil.addClass(children[next], properties.classes)
					children[next].firstChild.focus()
					event.stopPropagation()
					
				}
			}
		});
	}

	return {
		handle: handle
	};
} );