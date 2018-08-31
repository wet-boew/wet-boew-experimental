//
//  wb5.js
//  wet-boew-next generation research approach
//
//

// =============
// = Polyfills =
// =============

var polyfills = [],
	lang = ( document.documentElement.lang ) ? document.documentElement.lang : "en" ;

if ( !( "fetch" in window ) ) {
	polyfills.push( "polyfills/fetch" ) ;
}

if ( !( "Promise" in window ) ) {
	polyfills.push( "polyfills/promise" ) ;
}

if ( typeof Object.assign != "function" ) {
	polyfills.push( "polyfills/assign" ) ;
}

if ( !( "open" in document.createElement( "details" ) ) ) {
	polyfills.push( "polyfills/detailsummary" ) ;
}

if ( typeof HTMLDialogElement != "function" ) {
	polyfills.push( "polyfills/dialog" ) ;
	polyfills.push( "css!polyfills/dialog" ) ;
}

if ( !( "searchParams" in HTMLAnchorElement.prototype ) ) {
	polyfills.push( "polyfills/searchparameters" ) ;
}

// add the Pagevisibility Normalizing API
polyfills.push( "polyfills/pagevisibility" ) ;

// Lets add the CSS/Observer last to trigger the listener
//polyfills.push( "css!module/core/observer" ) ;

//console.log( "load :: " + (new Date).toISOString().replace(/z|t/gi,' ') );
// =======================
// = Stage the logic set =
// =======================
require( [ "module/element"  ].concat( polyfills ), function( _element ) {

	let urlParams = new URLSearchParams( window.location.search );

	if ( urlParams.has( "wb5" ) ) {

		let options = urlParams.get( "wb5" ).split( ":" ) ;

		lang = ( options.length > 1 ) ? options[ 1 ] : lang ;

		require( [ "css!module/accessibilty/audit/a11y-" + lang ], function() {} ) ;
	}

	let insertListener = function( event ) {
		if ( event.animationName === "nodeInserted" ) {

			let node = event.target,
				actions = _element.inspect( node ) ;

				for ( let idx = 0 ; idx < actions.length ; idx++ ) {
					let action = actions[ idx ] ;
					require( [ "module/" + action.command ], function( worker ) {
						worker.handle( node, action.selector, action.options ) ;
					} ) ;
				}

		}
	} ;

	document.addEventListener( "animationstart", insertListener, false ) ; // standard+ firefox
	document.addEventListener( "MSAnimationStart", insertListener, false ) ; // IE
	document.addEventListener( "webkitAnimationStart", insertListener, false ) ; // Chrome + Safari

	// Add the observer event binding
	document.head.appendChild(
		_element.css("@keyframes nodeInserted {\nfrom { opacity: 0.99; }\nto { opacity: 1; }\n}\n\n[data-wb5] {animation-duration: 0.001s;animation-name: nodeInserted;}" )
	);

} ) ;


