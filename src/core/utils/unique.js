/**
 * Unique Util Class.
 *
 * @author Government of Canada
 * @version 1.0
 */

define([], function () {
    "use strict";

    // Constants
    const NAME = 'modal';
    const VERSION = '4.3.1';

    // Protected variables (via scope)
    let counter = 0;

    // Class
    class UniqueUtil {

        // Getters

        static get VERSION() {
            return VERSION
        }

        getId() {
            return "wb:id:" + counter++
        }

    }

    return new UniqueUtil()

});
