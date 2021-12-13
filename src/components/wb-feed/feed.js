/**
 * Feeds plugin
 * @author Government of Canada
 * @version 1.0
 */

import * as Uniq from '../../core/utils/unique.js'
import * as Strng from '../../core/utils/string.js'


class Feed extends HTMLElement {

	constructor() {
		// Always call super first in constructor
		super();
		this.id = Uniq.getId();
	}

	connectedCallback() {
		console.log(  'Web Feed Connected! ' + Strng.pad( '0', 3 ) + ' entries set'  );
		console.log(  this );
	}

	disconnectedCallback() {
		console.log('Custom element removed from page.');
	}

	attributeChangedCallback(name, oldValue, newValue) {
		console.log('Custom element attributes changed.');
	}
}

customElements.define("wb-feed", Feed);
