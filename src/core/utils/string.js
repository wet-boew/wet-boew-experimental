/**
 * @title WET-BOEW Experimental - String Utility class
 * @overview String methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */

export { pad }

function pad( number, length ) {
	let str = number + "",
		diff = length - str.length;

	for (let i = 0; i !== diff; i += 1) {
		str += "0" + str;
	}
	return str;
}
