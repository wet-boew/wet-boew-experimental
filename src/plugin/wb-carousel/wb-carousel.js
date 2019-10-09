/**
 * Carousel class - a content element replace with fetched content
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( [ ], function( ) {
	"use strict";
	
	class Carousel extends HTMLElement {

		constructor() {
			// Always call super first in constructor
			super();

			console.log( "[ i18n ] -> " + this.i18n.greeting );

		}


		connectedCallback() {
			console.log('Custom element added to page.');

		}

		disconnectedCallback() {
			console.log('Custom element removed from page.');
		}

		adoptedCallback() {
			console.log('Custom element moved to new page.');
		}

		attributeChangedCallback(name, oldValue, newValue) {
			console.log('Custom element attributes changed.');
		}
	}

	customElements.define("wb-carousel", Carousel);

});
