// =============
// = Polyfills =
// =============

var polyfills = [],
    lang = ( document.documentElement.lang ) ? document.documentElement.lang : "en";

// =========================
// CONFIGURATION
// =========================
requirejs.config({
   config: {
        //i18n: {
        //    locale: lang
       // }
   }
});

/* COMPATIBILITY CODEBASES
 ----------------------------- */
define( 'jquery', [], function() { return ( window.jQuery ) ? window.jQuery : {}; } );



require(['core/dom/stylesheet'], function( Stylesheet  ) {
    // Lets bind the dictionary to the window-object


    let insertListener = function( event ) {
		if (
            event.animationName === "nodeInserted" &&
            event.target.tagName.startsWith("WB-")
        ) {
            //let node = Object.assign( event.target, { i18n: i8n} ),
            let node = event.target,
                tagName = node.tagName.toLowerCase(),
                id = tagName.substring( tagName.indexOf('-') + 1 );
            require( [ "plugin/" + id + "/" + id ], function( element ) {

                // Call the init() function when defined (like in wb-xtemplate)
                // # wb-carousel.js use the global object customElements.define as per the living standard. So it don't need this init call.
                //if ( element && element.init ) {
                //    element.init( node );
               // }

            }) ;
		}

	}

	document.addEventListener( "animationstart", insertListener, false ) ; // standard+ firefox
	document.addEventListener( "MSAnimationStart", insertListener, false ) ; // IE
	document.addEventListener( "webkitAnimationStart", insertListener, false ) ; // Chrome + Safari

	// Add the observer event binding
	document.head.appendChild(
		Stylesheet.css("@keyframes nodeInserted {\nfrom { opacity: 0.99; }\nto { opacity: 1; }\n}\n\n[v] {animation-duration: 0.001s;animation-name: nodeInserted;}" )
    );

    //console.log( "WET 5 lives.. greeting >> " + i8n.greeting );
});
