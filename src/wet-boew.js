
import * as Stylesheet from "./core/dom/stylesheet.js";
import { loadJS } from "./core/utils/fetch.js"

export { relativeSrcPath };

// Init, calculate the root folder --Needed for the developer version--
let pageAnchor = document.createElement( "a" );
pageAnchor.href = window.location;

let pageUrlFolders = pageAnchor.pathname.replace( /^([^/])/, "/$1" ).split( "/" ).reverse(),
	relativeSrcPath = "",
	relSrcPathCompile = "";
for ( let i = 0; i < pageUrlFolders.length; i++ ) {

	if ( pageUrlFolders[ i ] !== "src" ) {
		relSrcPathCompile += "../";
	} else if ( pageUrlFolders[ i ] === "src" ) {
		relativeSrcPath = relSrcPathCompile;
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
	if ( event.animationName === "nodeInserted" ) {
		importLiveComponent( event.target );
	}
};

let importLiveComponent = function( node ) {
	let tagName = node.tagName.toLowerCase(),
		idxComponentName = tagName.indexOf('-'),
		componentName = tagName.substring( idxComponentName + 1 );

	// Check if we have customized built-in element
	if ( idxComponentName === -1 ) {
		let isBuiltIn = node.getAttribute( "is" );
		if ( !isBuiltIn ) {
			throw "Invalid live import component: " + tagName;
		}
		tagName = isBuiltIn;
		idxComponentName = isBuiltIn.indexOf('-');
		componentName = isBuiltIn.substring( idxComponentName + 1 );
	}
	if ( idxComponentName === -1 ) {
		throw "Invalid custom element name:" + tagName;
	}

	// Evaluate the type of component: sites; components, templates
	let isComponent = node.parentNode.nodeName === "MAIN" || isNodeAComponent( node ),
		folderImport = isComponent ? "./components/" : "./sites/";

	// import the component with support for legacy initialization
	import( folderImport + tagName + "/" + componentName + ".js" )
		.then( ( module ) => {
			// Call the init() function when defined (like in wb-xtemplate)
			if ( module.init ) {
				module.init( node );
			}
		}
	);
};

let isNodeAComponent = function( node ) {
	let parents = $( node ).parentsUntil( "main"),
		lastParent = parents.length && parents[ parents.length - 1 ].nodeName;
	return !!( lastParent && lastParent !== "FOOTER" && lastParent !== "HTML" );
};

// First initialization, including elements that are not in scope of animation
[].forEach.call( document.querySelectorAll( ":not(:defined)" ), function( elm ) {
	importLiveComponent( elm );
} );

// Add the observer event binding
document.addEventListener( "animationstart", insertListener, false ) ;
document.head.appendChild (
	Stylesheet.css( "@keyframes nodeInserted {\nfrom { opacity: 0.99; }\nto { opacity: 1; }\n}\n\n:not(:defined) {animation-duration: 0.001s;animation-name: nodeInserted;}" )
);
