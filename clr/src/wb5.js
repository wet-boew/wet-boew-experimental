//
//  wb5.js
//  wet-boew-next generation research approach
//
//

// =============
// = Polyfills =
// =============

let polyfills = [];

if ( !"fetch" in window ) {
	polyfills.push( "polyfills/fetch" );
}

if ( !"Promise" in window ) {
	polyfills.push( "polyfills/promise" );
}

if ( typeof Object.assign != "function" ) {
	polyfills.push( "polyfills/assign" );
}

if ( !( "open" in document.createElement( "details" ) ) ) {
	polyfills.push( "polyfills/detailsummary" );
}

if (typeof HTMLDialogElement != 'function')
{
	polyfills.push( "polyfills/dialog" );
	polyfills.push( "css!polyfills/dialog" );
}

// add the Pagevisibility Normalizing API
polyfills.push( "polyfills/pagevisibility" );

// Lets add the CSS/Observer last to trigger the listener
polyfills.push( "css!module/core/observer" );

//console.log( "load :: " + (new Date).toISOString().replace(/z|t/gi,' ') );
// =======================
// = Stage the logic set =
// =======================
require( [ "module/element"  ].concat( polyfills ), function( _element ) {

	var insertListener = function( event ) {
		if ( event.animationName === "nodeInserted" ) {

			let node = event.target,
				actions = _element.parse( node );

				for ( var idx = 0; idx < actions.length; idx++ ) {
					let action = actions[ idx ];
					require( [ "module/" + action.command ], function( worker ) {
						worker.handle( node, action.selector, action.options );
					} );
				}

		}
	};

	document.addEventListener( "animationstart", insertListener, false ); // standard+ firefox
	document.addEventListener( "MSAnimationStart", insertListener, false ); // IE
	document.addEventListener( "webkitAnimationStart", insertListener, false ); // Chrome + Safari

} );


