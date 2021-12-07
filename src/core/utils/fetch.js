/**
 * @title WET-BOEW Experimental - Fetch JS with SRI
 * @overview Fetch JS methods for WET
 * @license wet-boew.github.io/wet-boew/License-en.html / wet-boew.github.io/wet-boew/Licence-fr.html
 * @author WET Community
 */

export { loadJS }

let vendorSRI = {

	// https://github.com/janl/node-jsonpointer/blob/master/jsonpointer.js
	jsonpointer: {
		integrity: "sha256-XGf6dDC59THcCt8JSIIj5c/V9/1ZL1jXsHVFgqV3xRY=",
		main: "jsonpointer.js",
		contentType: "application/javascript",
		UMDheader: "( function( wnd ) {\n\"user strict\";\nlet exports = {};\n",
		UMDfooter: "wnd.jsonPointer = exports;\n} )( window );",
		testReady: function() {
			return window.jsonPointer;
		}
	}
};

// Function to deal with the dependency racing issue
let whenLibReady = function( testCallback, readyCallback, failCallback, nbTry ) {
	if ( testCallback() ) {
		readyCallback();
	} else {
		setTimeout( function() {
			nbTry = nbTry - 1;
			if ( nbTry ) {
				whenLibReady( testCallback, readyCallback, failCallback, nbTry );
			} else {
				failCallback();
			}
		}, 50 );
	}
}

// Load the script
async function loadJS ( vendorName ) {

	// Get vendor library integration information
	let vendorInfo = vendorSRI[ vendorName ];

	// Fetch the vendor lib and ensure it is what we expect
	await fetch( "/src/vendor/" + vendorName + "/" + vendorInfo.main, { integrity: vendorInfo.integrity } ).then( function( response ) {

		// Is the resource are the one expected
		if ( !response.ok ) {
			throw "Resource not found or invalid:" + vendorName;
		}

		// Wrap the vendor lib if needed
		return ( vendorInfo.UMDheader ? response.text().then( function( text ) {
				return new Promise( ( resolve, reject ) => {
					text = vendorInfo.UMDheader + text + vendorInfo.UMDfooter;
					let blobUMD = new Blob( [ text ], { type: vendorInfo.contentType } );
					resolve( blobUMD );
				} );
			} ) : response.blob() );

	}).then( function( myBlob ) {

		// Add and load the fetched script to the page
		let objectURL = URL.createObjectURL( myBlob );
		let sc = document.createElement( "script" );
		sc.setAttribute( "src", objectURL );
		sc.setAttribute( "type", "text/javascript" );
		document.head.appendChild( sc );

	}).then( function() {

		// Ensure the script is ready for use
		return new Promise( ( resolve, reject ) => {
			if ( !vendorInfo.testReady ) {
				resolve();
			}
			whenLibReady( vendorInfo.testReady, resolve, reject, 10 );
		} );

	} );
}
