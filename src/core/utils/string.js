/**
 * @title WET-BOEW Experimental - String Utility class
 * @overview String methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */
define([], function () {
  "use strict";

  /* PLUGIN DEFAULTS
   ----------------------------- */
  const NAME = 'modal';
  const VERSION = '4.3.1';

  /* CLASS
   ----------------------------- */
  class StringUtil {

    static get VERSION() {
      return VERSION
    }


    pad(number, length) {
      let str = number + "",
        diff = length - str.length;

      for (let i = 0; i !== diff; i += 1) {
        str += "0" + str;
      }
      return str;
    }
  }

  /* EXPORT
   ----------------------------- */
  return new StringUtil()
});
