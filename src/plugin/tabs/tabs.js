/**
 * Feeds plugin
 * @author Government of Canada
 * @version 1.0
 */

import * as Uniq from '../../core/utils/unique.js'

class Tabs extends HTMLElement {

	constructor() {
		// Always call super first in constructor
		super();
		this.id = Uniq.getId();
	}

	connectedCallback() {
		console.log(  'Tabs Connected! ' );
		console.log(  this );
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

customElements.define("wb-tabs", Tabs);
