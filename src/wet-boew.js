
import * as Stylesheet from "./core/dom/stylesheet.js";
import { loadJS } from "./core/utils/fetch.js"


export { relativeSrcPath };

// Init, calculate the root folder --Needed for the developer version--
let pageAnchor = document.createElement( "a" );
pageAnchor.href = window.location;

let pageUrlFolders = pageAnchor.pathname.replace( /^([^/])/, "/$1" ).split( "/" ).reverse(),
	relativeSrcPath = "";
for ( let i = 0; i < pageUrlFolders.length; i++ ) {

	if ( pageUrlFolders[ i ] !== "src" ) {
		relativeSrcPath += "../"
	} else if ( pageUrlFolders[ i ] === "src" ) {
		break;
	}
}
if ( !relativeSrcPath ) {
	relativeSrcPath = "./";
}



// Load the third party library
await loadJS( "cash" );

// =============
// = Polyfills =
// =============

var polyfills = [],
		lang = ( document.documentElement.lang ) ? document.documentElement.lang : "en";


/* COMPATIBILITY CODEBASES
 ----------------------------- */
//define( 'jquery', [], function() { return ( window.jQuery ) ? window.jQuery : {}; } );


// Load module dynamically
let insertListener = function( event ) {
	if ( event.animationName === "nodeInserted" && event.target.tagName.startsWith( "WB-" ) ) {

		//let node = Object.assign( event.target, { i18n: i8n} ),
		let node = event.target,
			tagName = node.tagName.toLowerCase(),
			id = tagName.substring( tagName.indexOf('-') + 1 );

		// Evaluate the type of component: sites; components, templates

		let isComponent = node.parentNode.nodeName === "MAIN" || isNodeAComponent( node ),
			folderImport = isComponent ? "./components/" : "./sites/";

		import( folderImport + id + "/" + id + ".js" )
			.then( ( module ) => {
				// Call the init() function when defined (like in wb-xtemplate)
				// # wb-carousel.js use the global object customElements.define as per the living standard. So it don't need this init call.
				if ( module.init ) {
					module.init( node );
				}
			}
		);
	}
}

let isNodeAComponent = function( node ) {
	var parents = $( node ).parentsUntil( "main");
	return !!( parents.length && parents[ parents.length - 1 ].nodeName !== "FOOTER" );
};


// Add the observer event binding
document.addEventListener( "animationstart", insertListener, false ) ; // standard+ firefox
document.addEventListener( "MSAnimationStart", insertListener, false ) ; // IE
document.addEventListener( "webkitAnimationStart", insertListener, false ) ; // Chrome + Safari
document.head.appendChild (
	Stylesheet.css( "@keyframes nodeInserted {\nfrom { opacity: 0.99; }\nto { opacity: 1; }\n}\n\n[v] {animation-duration: 0.001s;animation-name: nodeInserted;}" )
);
