/**
* keys.js - allow navigation through lists with the keyboard
* @returns {void}
*/
define( [ "module/element" ], function( ElementUtil ) {

	/**
	* keycode - determines what action to take when a key is pressed
	* @private
	* @param {object} event - the event that contains information about the key
	* @param {string} orientation - whether the menu is horizontal or vertical (navigated with left/right or up/down)
	* @returns name of action to take or false if invalid key
	* @type string / bool
	*/
	function keycode( event, orientation ) {

		let code = event.charCode || event.keyCode;
		if ( code == 9 ) {
			return 'tab';
		}
		if ( code == 13 ) {
			return 'enter';
		}
		if ( code == 27 ) {
			return 'exit';
		}
		if ( orientation == "horizontal" ) {
			if ( code == 39 ) { //right arrow
				return 'increment';
			}
			if ( code == 37 ) { //left arrow
				return 'decrement';
			}
			if ( code == 40 ) { //down arrow
				return 'enter';
			}
		}
		else {
			if ( code == 40 ) { //down arrow
				return 'increment';
			}
			if ( code == 38 ) { //up arrow
				return 'decrement';
			}
			if ( code == 39 ) { //right arrow
				return 'enter';
			}
			if ( code == 37 ) { //left arrow
				return 'exit';
			}
		}
		return false;
	};

	/**
	* find - determines which item from a set has a certain class
	* @private
	* @param {NodeList} $children - the set of items from which to check
	* @param {string} classname - the class to look for
	* @returns the index of the element if found, -1 if not
	* @type int
	*/	
	function find( $children, classname ) {

		for (let idx = $children.length - 1; idx >= 0; idx--) {
			if ( ElementUtil.hasClass( $children[idx], classname) )
			{
				return idx
			}
		}
		return -1;
	};

	/**
	* the main function body
	* @public
	* @param {DOMElement} $elm the element for which the data-wb5 attribute is located
	* @param {String} selector the CSS3 query string to which target the children or not
	* @param {Object} options - for the element/node
	* @returns void
	*/
	function handle( $elm, selector, options ) {

		let properties = Object.assign({ eventname: "keypress", classes: "active", orientation: "horizontal" }, options ),
		children = ElementUtil.nodes( $elm, selector );

		//Add class and event listeners
		if (!$elm.classList.contains( "menu" )) {
			$elm.classList.add( "menu" );
		}
		listen( $elm, $elm, properties, properties.orientation )
		for( let child of children) {
			if ( !child.classList.contains( "sm" ) ) {
				child.classList.add( "sm" );
			}
			listen( child, $elm, properties );
		}
	};

	/**
	* listen - attaches listener to handle key presses
	* @private
	* @param {DOMElement} $elm - the element that captured the event
	* @param {DOMElement} menubar - reference to the primary menu bar
	* @param {Object} properties - contains module configuration data
	* @param {String} orientation - whether the menu is horizontal or vertical (navigated with left/right or up/down)
	* @returns void
	*/
	function listen($elm, menubar, properties, orientation="vertical"){

		let children = $elm.children;
		ElementUtil.addListener( $elm, properties.eventname, function( event ){
			let advance,
			current = find( children, "active" ),
			total = children.length,
			next = 0,
			key = keycode( event, orientation );

			if ( !key ) { //invalid key press
				return;
			}
			if ( key == 'tab' ) {	//close all menus when Tab key is pressed
				for ( let node of children ) {
					ElementUtil.removeClass( node, properties.classes );
				}
			}
			else {
				event.preventDefault();	//prevent screen from moving with up/down arrows
				if (key == 'enter'){	//enter a submenu
					let childLink = children[ current ].querySelector( "ul" );
					if ( childLink ) {
						childLink = childLink.querySelector( "li > a" );
						childLink.focus();
						ElementUtil.addClass( children[current], properties.classes );
						childLink.focus();
					}
					else { //if there is no submenu, then the right arrow should advance the main menu bar
						if ( properties.orientation == "horizontal" ) {
							menubar.dispatchEvent( new KeyboardEvent( event.type, event ) );
						}
					}
					event.stopPropagation();
				}
				else if( key == 'exit' ) { //exit a submenu
					if ( $elm.parentElement.parentElement.classList.contains( "menu" ) ) { //if there is no submenu, then the left arrow should decrement the main menu bar
						return;
					}
					$elm.parentElement.querySelector( "li > a" ).focus();
					event.stopPropagation();
				}
				else if ( key == 'increment' || key == 'decrement' ) {
					advance = (key == 'increment') ? 1 : -1;
					if ( current + advance < total ) {
						next = current + advance;
						next = ( next < 0 ) ? total + next : next;
					}
					
					if ( current + advance > total ) {
						next = current + advance;
						next = ( next > total ) ? total - next : next;
					}
					if ( current > -1 ) { //only attempt to deselect a menu if there is one already selected
						ElementUtil.removeClass( children[ current ], properties.classes );
					}
					ElementUtil.addClass( children[ next ], properties.classes );
					children[ next ].firstChild.focus();
					event.stopPropagation();
				}
			}
		});
	};

	return {
		handle: handle
	};
} );