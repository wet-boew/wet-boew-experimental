/**
 * Barebone plugin
 * @author Government of Canada
 * @version 1.0
 * @requires
 */

/*
Note:

<link is="wb.dev-css" rel="stylesheet" href="{{ Url of the CSS}}" />

To recompile postCSS, you can simply browserify the following file:
--- BEGIN of file ---
const postcss = require('postcss');
const postcssPresetEnv = require('postcss-preset-env');

window.postcss = postcss;
window.postcssPresetEnv = postcssPresetEnv;
--- END of file ---

*/

import { relativeSrcPath } from "../../wet-boew.js";
import { loadJS } from "../../core/utils/fetch.js"

// Load the third party library
await loadJS( "postcss" );

class WxtdevCSS extends HTMLLinkElement {

	constructor() {
		super();
	}

	connectedCallback() {

		// Polyfill the CSS and overwrite via a clone
		if ( this.rel.toLowerCase() === "stylesheet" ) {
			this._polyfillCSS( this.href ).then( ( CSSblobURL ) => {
				let lnk = document.createElement( "link" );
				lnk.setAttribute( "href", CSSblobURL );
				lnk.setAttribute( "rel", "stylesheet" );
				document.head.appendChild( lnk );
			} );
		}
	}

	disconnectedCallback() {
		// TODO: Unload blob URL that was loaded
	}

	async _polyfillCSS( path ) {

		let _self = this;
		let pathFolder = path.match( /^(.*?\/)*(.*?\/)/g )[ 0 ] || "";

		// 1. Fetch the CSS file
		let localURL = await fetch( path ).then( function( response ) {

			// Is the resource are the one expected
			if ( !response.ok ) {
				throw "Resource not found or invalid:" + vendorName;
			}


			return response.text();

		}).then( function( text ) {
			return new Promise( async ( resolve, reject ) => {

				// Extract CSS import, make it relative to parent
				let matches = text.matchAll( /@import\s*url\s*\(\s*\"(.*?)\"/g ),
					cntMatch = 0;

				for ( let importPath of matches ) {

					// Repeat the polyfill for this import, file URL is relative to this file
					let newImportURL = await _self._polyfillCSS( pathFolder + importPath[ 1 ] );

					// Replace the import path by the new URL.
					text = text.replace( importPath[ 1 ], newImportURL );

					cntMatch ++;
				}

				// Polyfill the CSS file with postCSS
				let textUpdated = await window.postcss( window.postcssPresetEnv( { stage: 0 } ) ).process( text ).then( result => { return result.css; } );

				if ( textUpdated === text && !cntMatch ) {
					// Return it's location
					resolve ( path );
					return;

				}

				// TODO: Adapt/Convert all url() except the @import at rule

				// Create the virtual file
				textUpdated = "/* Virtual copy of: " + path + " */\n\n" + textUpdated;
				let myBlob = new Blob( [ textUpdated ], { type: "text/css" } );
				let objectURL = URL.createObjectURL( myBlob );
				resolve( objectURL );
			} );
		} );

		return localURL;
	}
}

customElements.define("wb.dev-css", WxtdevCSS, { extends: "link" } );
