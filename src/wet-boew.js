// =============
// = Polyfills =
// =============

var polyfills = [],
	lang = ( document.documentElement.lang ) ? document.documentElement.lang : "en" ;

require(['i18n!i18n/base'], function( base ) {
    console.log( "WET 5 lives.. greeting >> " + base.greeting );
});
