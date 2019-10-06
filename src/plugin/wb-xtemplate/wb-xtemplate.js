/**
 * Experimental Template class - Map a data into an HTML template
 * @author Government of Canada
 * @version 1.0
 * @requires
 */

//
// What the plugin do
// 
// * Take a JSO and parse in inside a tempalte
// * Expose that JSO globally in the project
// * Have change to the JSO be reflected in the template


/*

	We will need to find out an JSON pointer library conform to RFC 6901

	JSON-fetch use: https://github.com/alexeykuzmin/jsonpointer.js/blob/master/src/jsonpointer.js
	And may be this one?: https://github.com/janl/node-jsonpointer/blob/master/jsonpointer.js

*/

/*

RENDER 
<wb-xtemplate data="{ <JSON STRING> }">

	<template>
		<p>{{ mydata }}</p>
	<template>

</wb-xtemplate>

Extract

<wb-xtemplate selector="{ Mapping from a JSON Pointer with CSS selector }">

	<h2>My data</p>
	<p>une description</p>
</wb-xtemplate>

*/



define( [ "../../vendor/jsonpointer/jsonpointer" ], function( jsonPointer ) {
    "use strict";


    let namespaceData = {};
    let namespaceElement = {};
	let lastNamespaceElement = "";

    // Plugin init function
	function init( elm ) {

		// Get plugin properties
		var dataExtracted = extractDataStructure( elm, elm.getAttribute( "selector" ) );

		console.log( dataExtracted );
	}

	function extractDataStructure( elm, rawSelectors ) {

	/*

	data1 => Just a property
	data2/ => This is an array
	data3/item1 => sub object


Input:

HTML

<h2>My data</p>
    <p class="data1">data1</p>
    <p class="data2">data2</p>
    <p class="data3">data2</p>
    <ul class="data4"> <!-- data 4 -->
        <li><span class="dataa">data4a-1</span> - <div class="subObject"><span class="datab">data4b-1</span> - <span class="datac">data4c-1</span></div></li>
        <li><span class="dataa">data4a-2</span> - <div class="subObject"><span class="datab">data4b-2</span> - <span class="datac">data4c-2</span></div></li>
        <li><span class="dataa">data4a-3</span> - <div class="subObject"><span class="datab">data4b-3</span> - <span class="datac">data4c-3</span></div></li>
    </ul>
    <div id="data5">
        <p class="dataa">data5a</p>
        <p class="datab">data5b</p>
        <p class="datac">data5c</p>
    </div>

Selector attribute

{
	"/data1": ".data1",
	"/data2":".data2",
	"/data3":".data3",
	"/data4/":".data4 li",
	"/data4/data4a":".dataa",
	"/data4/data4b":".datab",
	"/data4/data4c":".datac",
	"/data4/subobj/data4b":".datab",
	"/data4/subobj/data4c":".datac",
	"/data5":"#data5",
	"/data5/data5a":".dataa",
	"/data5/data5b":".datab",
	"/data6/data6a":".datac"
}

Transit object

[
	[	
		{
			"key":"/data1",
			"value":".data1",
			"namespace":"/",
			"subspace":"",
			"prop":"/data1",
			"path":"/data1",
			"isList":false
		},
		{
			"key":"/data2",
			"value":".data2",
			"namespace":"/",
			"subspace":"",
			"prop":"/data2",
			"path":"/data2",
			"isList":false
		},
		{
			"key":"/data3",
			"value":".data3","namespace":"/","subspace":"","prop":"/data3","path":"/data3","isList":false},{"key":"/data4/","value":".data4 li","namespace":"/","subspace":"","prop":"/data4","path":"/data4","isList":true},{"key":"/data5","value":"#data5","namespace":"/","subspace":"","prop":"/data5","path":"/data5","isList":false}],[{"key":"/data4/data4a","value":".dataa","namespace":"/data4/","subspace":"","prop":"/data4a","path":"/data4/data4a","isList":false,"subspaceMod":true,"hasProcessed":true},{"key":"/data4/data4b","value":".datab","namespace":"/data4/","subspace":"","prop":"/data4b","path":"/data4/data4b","isList":false,"subspaceMod":true,"hasProcessed":true},{"key":"/data4/data4c","value":".datac","namespace":"/data4/","subspace":"","prop":"/data4c","path":"/data4/data4c","isList":false,"subspaceMod":true,"hasProcessed":true},{"key":"/data5/data5a","value":".dataa","namespace":"/data5/","subspace":"data5/","prop":"/data5/data5a","path":"/data5/data5a","isList":false,"propSubspaceSet":true},{"key":"/data5/data5b","value":".datab","namespace":"/data5/","subspace":"data5/","prop":"/data5/data5b","path":"/data5/data5b","isList":false,"propSubspaceSet":true},{"key":"/data6/data6a","value":".datac","namespace":"/data6/","subspace":"data6/","prop":"/data6/data6a","path":"/data6/data6a","isList":false,"propSubspaceSet":true}],[{"key":"/data4/subobj/data4b","value":".datab","namespace":"/data4/subobj/","subspace":"subobj/","prop":"/subobj/data4b","path":"/data4/subobj/data4b","isList":false,"subspaceMod":true,"propSubspaceSet":true,"hasProcessed":true},{"key":"/data4/subobj/data4c","value":".datac","namespace":"/data4/subobj/","subspace":"subobj/","prop":"/subobj/data4c","path":"/data4/subobj/data4c","isList":false,"subspaceMod":true,"propSubspaceSet":true,"hasProcessed":true}]]

Final Object (with a reference to a DOM Node)

{
	"data1":{},
	"data2":{},
	"data3":{},
	"data4": [
		{
			"data4a":{},
			"data4b":{},
			"data4c":{},
			"subobj":
				{
					"data4b":{},
					"data4c":{}
				}
		},
		{
			"data4a":{},
			"data4b":{},
			"data4c":{},
			"subobj":
				{
					"data4b":{},
					"data4c":{}
				}
		},
		{
			"data4a":{},
			"data4b":{},
			"data4c":{},
			"subobj":
				{
					"data4b":{},
					"data4c":{}
				}
		}
	],
	"data5":
		{
			"data5a":{},
			"data5b":{}
		},
	"data6":
		{
			"data6a":{}
		}
	}
		*/


		let extractedData = {};
		let selectors = JSON.parse( rawSelectors || {} );

		// Order the selectors to avoid processing errors. Like if the "array" is defined after its containing items
		// ex: { "data3/data3a": value, "data3/": value } ==> should be { "data3/": value, "data3/data3a": value }
		// This can be dev validation rule

		let preProcessedKey = [];
		let maxDeep = 0;

		for ( const [ key, value ] of Object.entries( selectors ) ) {


			// Parse the key
			let isList = key.lastIndexOf( "/" ) === key.length - 1,
				deep = ( key.match( /\//g ) || [] ).length - (isList ? 1 : 0) - 1,
				path = isList ? key.slice( 0, -1 ) : key,
				propParsed = path.match( /(^(.+?\/)+)/ ), 
				namespace = propParsed && propParsed[ 0 ] || "/",
				prop = "/" + path.substring( namespace.length );

			if ( deep > maxDeep ) {
				maxDeep = deep;
			}
			preProcessedKey[ deep ] = preProcessedKey[ deep ] || [ ];

			let transitObjNew = {
				key: key,
				value: value,
				namespace: namespace,
				subspace: namespace.substring( 1 ),
				prop: prop,
				path: path,
				isList: isList
			}

			if ( namespace ) {
				namespaceData[ namespace ] = namespaceData[ namespace ] || [ ];
				namespaceData[ namespace ].push( transitObjNew );
			}

			preProcessedKey[ deep ].push( transitObjNew );
		}

		for ( let i = 0 ; i <= maxDeep; i += 1 ) {
			const i_cache = preProcessedKey[ i ];

			//  Get the element associated to the namespaces
			for( let j = 0 ; j !== i_cache.length; j += 1 ) {
				const transitObj = i_cache[ j ];

				if ( !transitObj.hasProcessed ) {
					retreiveData( elm, transitObj, extractedData );
				}
			}
		}

		// We can dispose of:
		namespaceData = {};
    	namespaceElement = {};
		lastNamespaceElement = "";

		return extractedData;
	}



	function retreiveData( elm, transitObj, finalObj ) {

		// Caching for sub object
		if ( transitObj.subspace ) {

			if ( namespaceElement[ transitObj.namespace ] ) {
				elm = namespaceElement[ transitObj.namespace ];
			} else {

				// If sub-object, let object to be in the namespaceElement
				let elmFromSubspace = jsonPointer.get( finalObj, "/" + transitObj.subspace.slice( 0, -1 ) );

				if ( elmFromSubspace ) {
					namespaceElement[ transitObj.namespace ] = elmFromSubspace;

					// We remove the existing reference
					jsonPointer.set( finalObj, "/" + transitObj.subspace.slice( 0, -1 ), undefined);
					elm = elmFromSubspace;
				} else {
					namespaceElement[ transitObj.namespace ] = elm;
					jsonPointer.set( finalObj, "/" + transitObj.subspace.slice( 0, -1 ), {});
				}
			}
			if ( !transitObj.propSubspaceSet ) {
				transitObj.prop = "/" + transitObj.subspace + transitObj.prop.substring( 1 );
				transitObj.propSubspaceSet = true;
			}

			lastNamespaceElement = transitObj.namespace;
		}

		// Get the DOM element
		if ( transitObj.isList ) {

			let elmToUse = elm.querySelectorAll( transitObj.value );
			namespaceElement[ transitObj.namespace ] = elmToUse;

			retreiveInfo( elmToUse, transitObj, finalObj );

		} else {

			if ( !elm ) {

				// elm should be always defined, if not there is a bug.
				console.log( transitObj );
			}

			// ok, let fix this obj
			let domSelected = elm.querySelector( transitObj.value );
			jsonPointer.set( finalObj, transitObj.prop, domSelected );

		}


	}


	function extractSubObj( elm, listTransitObj ) {

		let finalSubObj = {};

		// For each data in that namespace
		for( let i = 0; i !== listTransitObj.length; i += 1 ) {

			const transitObj = listTransitObj[ i ];

			if( !transitObj.subspaceMod && transitObj.subspace ) {

				// Remove 1 level 
				transitObj.subspace = transitObj.subspace.match( /(?<=\/).*/ )[ 0 ] || "";
				transitObj.subspaceMod = true;
			}

			retreiveData( elm, transitObj, finalSubObj );

		}

		return finalSubObj;
	}

	function retreiveInfo( elm, transitObj, finalObj ) {


		if ( elm.length ) {
			let ArrayOfItem = [];

			// Merge down the namespaceData that are more specific
			let keyToRemove = [];
			for ( const [ key, value ] of Object.entries( namespaceData ) ) {

				if ( key.indexOf( transitObj.key ) !== -1 && key.length > transitObj.key.length ) {

					namespaceData[ transitObj.key ] = namespaceData[ transitObj.key ].concat( value );
					keyToRemove.push( key );
				}
			}

			// Iterate on the element,
			for( let i = 0; i !== elm.length; i += 1 ) {

				const currentElm = elm[ i ];
				const objToSave = extractSubObj( currentElm, namespaceData[ transitObj.key ] );

				if( lastNamespaceElement ) {
					delete namespaceElement[ lastNamespaceElement ]
				}
				ArrayOfItem.push( objToSave );
			}

			jsonPointer.set( finalObj,  transitObj.path, ArrayOfItem );


			// Remove the subSet from being processed again
			let listOfData = namespaceData[ transitObj.key ];
			for( let i = 0; i !== listOfData.length; i += 1 ) {
				listOfData[ i ].hasProcessed = true;
			}


		} else {

			const objToSave = extractSubObj( elm, namespaceData[ transitObj.key ] );
			jsonPointer.set( finalObj, transitObj.path, objToSave );
		}

	}


	return {
		init: init
	};
} );

