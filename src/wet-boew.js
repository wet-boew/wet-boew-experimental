// =============
// = Polyfills =
// =============

var polyfills = [],
	lang = ( document.documentElement.lang ) ? document.documentElement.lang : "en" ;


// =========================
// CONFIGURATION
// =========================
requirejs.config({
    config: {
        i18n: {
            locale: lang
        }
    }
});
require(['i18n!nls/dctnry'], function( i8n ) {
    console.log( "WET 5 lives.. greeting >> " + i8n.greeting );
});
