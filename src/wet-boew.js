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

require(['i18n!nls/dctnry', 'lib/dom/stylesheet'], function( i8n, Stylesheet  ) {
    // Lets start the look

    let insertListener = function( event ) {
		if ( 
            event.animationName === "nodeInserted" &&
            event.target.tagName.startsWith("WB-")
        ) {

            let node = event.target,
                tag =  "plugin/" + node.tagName.toLowerCase() + "/init";
               
					require( [ tag ], function( element, i8n ) {
						element.handle( node ) ;
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
    
    console.log( "WET 5 lives.. greeting >> " + i8n.greeting );
});
