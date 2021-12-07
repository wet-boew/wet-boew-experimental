/**
 * Unique Util Class.
 *
 * @author Government of Canada
 * @version 1.0
 */

export { getId };

// Constants
const NAME = 'modal';
const VERSION = '4.3.1';

// Protected variables (via scope)
let counter = 0;

function getId() {
	return "wb:id:" + counter++
}
