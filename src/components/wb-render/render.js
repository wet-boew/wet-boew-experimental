/**
 * Experimental Template - Take data with template and render reactive HTML
 * @author Government of Canada
 * @version 1.0
 */

export { init };

var doc = document;

// Plugin init function
function init( elm ) {


	// Get the JS object
	var jsObject = JSON.parse( elm.getAttribute( "datalayer" ) );


	// Allow the JS Object to be reactive
	jsObject = wb5React( jsObject );

	// Get the Template

	// Parser the string template into a DOM template
	var elmTemplate = doc.getElementById( elm.getAttribute( "template" ) );

	if ( !elmTemplate ) {
		throw "No template defined, please set a ID in the 'template' attribute"
	}

	// Do we need to polyfill?
	if ( !elmTemplate.content ) {
		IE11templatePolyfill( elmTemplate );
	}

	var clone = elmTemplate.content.cloneNode( true );


	// Mapping the jsObject into the template. After this the template would be updated in a reactive way
	walk( clone, jsObject );


	// Show the result
	elm.appendChild( clone );

	// Expose the data of jsObject and let the user play in their console
	elm.databind = jsObject.data;
	window.playground = jsObject.data;

}


var eventsToBeHook = [],
walk = function( node, dataObj, asScoped ) {

	var children = node.childNodes,
		i, i_cache,
		i_len = children.length,
		nodeToBeRemove = [];

	for( i = 0; i < i_len; i ++ ) {
		i_cache = children[ i ];

		// If it is a textNode and contain handlebar
		if ( i_cache.nodeType === 3	&& i_cache.textContent.indexOf( "{{") != -1 ) {

			var regExMustache = /{{\s?([^}]*)\s?}}/g;

			i_cache.textContent = i_cache.textContent.replace( regExMustache, function( a, b ) {
				return getObjectAt( dataObj.data, b.trim() );
			} );
		}

		// It's a document fragment node
		if ( i_cache.nodeName === "TEMPLATE" ) {

			// Get the template name if any, if no name then generate it and attach on the parent.
			// Cache it as being a default in the dataObj

			IE11templatePolyfill( i_cache );


			// Think if it will be better to cache it only later on, when that template would be actually needed
			var templateName = getAndRemoveAttr( i_cache, "data-wb5-template" );

			if ( !templateName ) {
				templateName = wb.getId();
			}

			if ( !i_cache.parentNode.hasAttribute( "data-wb5-template" ) ) {
				i_cache.parentNode.setAttribute( "data-wb5-template", templateName );
			}

			dataObj.tmplDefault( templateName, i_cache );


			//console.log( templateName );
			continue;
		}

		// Skip the current look if the current node is not an element
		if ( i_cache.nodeType !== 1 ) {
			continue;
		}

		// Parse Current node
		if ( i_cache.hasAttribute( "data-wb5-for" ) ) {
			// This is a iterator

			// Note: if this element contain a "if" it will be processed by the iterator template engine.

			var forAttr = getAndRemoveAttr( i_cache, "data-wb5-for" );
			var forParsed = parseFor( forAttr );


			var objToBeIterated = getObjectAt( dataObj.data, forParsed.for );

			if ( !objToBeIterated ) {
				console.log( dataObj.data );
				console.log( forParsed.for );
				throw "Iterator not found";
			}


			// Iterate (ObjToBeIterated need to be an array to know the "active" property)
			var opts_len = objToBeIterated.length;
			var i,
				nbNode = 0; // Number of added node


			objToBeIterated.wbLen = parseInt( opts_len ); // Ensure we don't get a reference but a copy

			if ( Array.isArray( objToBeIterated ) ) {
				objToBeIterated.active = nbNode;
			}

			for( i =0; i < opts_len; i++) {

				// TODO: Check if the i_cache is a template element, if so then run it as a sub-template
				// TODO: Check if the i_cache contains "data-wb5-template" elements, if do
				var cloneItm = i_cache.cloneNode( true );

				var ifParsed = processIf( cloneItm );


				var dt = {
					"wb-idx": i,
					"wb-nbNode": nbNode,
					parent: dataObj.data
				};
				dt[ forParsed.alias ] = objToBeIterated[ i ];


				// Make the new Data Reactive.....
				dt = wb5React( dt );

				if ( asScoped ) {
					dataObj.data[ asScoped ] = dt;
				}

				if ( !ifParsed.if || isTrue( ifParsed.if, dt.data, dataObj.data ) ) {

					nbNode = nbNode + 1;

					walk( cloneItm, dt, asScoped );
					node.appendChild( cloneItm );

				}


			}

			objToBeIterated.wbActive = nbNode; // Number of active nodes

			nodeToBeRemove.push( i_cache );

			continue;

		} else if ( i_cache.hasAttribute( "data-wb5-if" ) || i_cache.hasAttribute( "data-wb5-else" ) || i_cache.hasAttribute( "data-wb5-ifelse" ) ) {
			// This is a conditional


			console.log( "Call If" );

			var ifParsed = processIf( i_cache );

			console.log( ifParsed );

		}

		// Go deeper in the next children element
		walk( i_cache, dataObj, asScoped );
	}

	// Removing node that was used for iteration or not accepted by the "if" query
	i_len = nodeToBeRemove.length;
	for ( i = 0; i !== i_len; i = i + 1 ) {
		node.removeChild( nodeToBeRemove[ i ] );
	}


	//
	// Attribute Binding
	//
	if ( node.nodeType === 1 && node.hasAttribute( "data-wb5-bind" ) ) {
		var bindAttr = getAndRemoveAttr( node, "data-wb5-bind" ),
			bindList = bindAttr.split(", ");

		for ( var i	= 0; i < bindList.length; i++ ) {
			var bindPart = bindList[ i ].split("@");




			if ( !node[ bindPart[ 0 ] ] ) {
				// Initialize the value
				node.setAttribute( bindPart[ 0 ], getObjectAt( dataObj.data, bindPart[ 1 ] ) );

				// Observer
				dataObj.observe(bindPart[ 1 ], function (value) {

					if ( typeof node[ bindPart[ 0 ] ] !== "undefined" ){
						// Like the attribute "value"
						return node[ bindPart[ 0 ]] = getObjectAt( dataObj.data, bindPart[ 1 ] ) || '';
					} else {
						return node.setAttribute( bindPart[ 0 ], getObjectAt( dataObj.data, bindPart[ 1 ] )) || '';
				}
				});
			} else {
				// Initialize the value
				node[ bindPart[ 0 ]] = getObjectAt( dataObj.data, bindPart[ 1 ] );

				// Observer
				dataObj.observe(bindPart[ 1 ], function (value) {

				return node[ bindPart[ 0 ]] = getObjectAt( dataObj.data, bindPart[ 1 ] ) || '';
				});

			}
		}
	}

	//
	// TODO: InnerHTML and TextContent binding
	//
	if ( node.nodeType === 1 && node.hasAttribute( "data-wb5-text" ) ) {

		// Get the event that we need to listen to
		var onText = getAndRemoveAttr( node, "data-wb5-text" );

		// Initialize the value
		node.textContent = getObjectAt( dataObj.data, onText );

		// Observer
		dataObj.observe(onText, function (value) {
		return node.textContent = getObjectAt( dataObj.data, onText ) || '';
		});

	}

	//
	// Event listener
	//
	if ( node.nodeType === 1 && node.hasAttribute( "data-wb5-on" ) ) {

		// Get the event that we need to listen to
		var onAttr = getAndRemoveAttr( node, "data-wb5-on" );

		var multipleHandler = onAttr.split( "; "),
			i, i_len = multipleHandler.length;

		for ( i = 0; i < i_len; i++ ){

			var onPart = multipleHandler[ i ].split("@"),
				eventListener = onPart[ 0 ],
				eventAction = onPart[ 1 ],
				idxFirstParentesis = eventAction.indexOf( "(" ),
				idxLastParentesis = eventAction.lastIndexOf( ")" ),
				innerExpression;



			// Get the function that need to be trigger
			var fnToBeTrigger,
				expression;

			if ( idxFirstParentesis && idxLastParentesis ) {
				fnToBeTrigger = eventAction.substring(0, idxFirstParentesis).trim();
				expression = eventAction.substring( idxFirstParentesis + 1, idxLastParentesis ).trim();
			}

			if ( !fnToBeTrigger ) {
				throw "Error, an event handler need to call a function"
			}

			// Parse the inner expression, if any
			if ( expression ) {
				expression = parseExpression( expression, dataObj.data );
			}


			// Check if it need to be trigger now
			if ( eventListener === "live" ) {
				getObjectAt( dataObj.data, fnToBeTrigger ).call( dataObj.data, expression );
			} else {

				// Store the event handler information to be attached after the fragment in on the real DOM.
				eventsToBeHook.push(
					{
						nd: node,
						evt: eventListener,
						trigger: fnToBeTrigger,
						attr: expression
					}
				);
			}

		}

	}
},

getAndRemoveAttr = function( el, attr ) {
	var ret = el.getAttribute( attr );
	el.removeAttribute( attr );
	return ret;
},

// TODO: Write a series of test for finding quoted string
isTrue = function( condition, dt, dtParent ) {
	return !!parseExpression( condition, dt, dtParent );
},

parseExpression = function( exp, data, altData ){

	var regDoubleQuotes = /"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'/g; // https://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
	var regWordFunction = /[a-zA-Z]([^\s]+)/g;
	var regExMustache = /{{-\s?([^}]*)\s?-}}/g;

	//
	// Find double quotes string
	//
	var lstString = [];

	exp = exp.replace( regDoubleQuotes, function( a, b ) {
		var ret = "{{-" + lstString.length + "-}}";
		lstString.push( a );
		return ret;
	} );


	//
	// Find any word/function call (No space allowed and no string inside them)
	//
	exp = exp.replace( regWordFunction, function( a, b ) {

		var replacementValue,
			query = a.trim();

		// Replace internal mustache if any
		query = query.replace( regExMustache, function( a, b ) {
			return lstString[ b ];
		} );


		try {
			replacementValue = getObjectAt( data, query );
		} catch ( ex ) {
			try {
				replacementValue = getObjectAt( altData, query );
			} catch ( exx ){
				console.log( "Information in the DATA obj not found" );
				console.log( altData );
				console.log( query );
			}
		}


		if (typeof replacementValue === "object") {
			// Stringfy the value
			replacementValue = JSON.stringify( replacementValue );
		}

		if (typeof replacementValue === "string" ) {
			return "\"" + replacementValue + "\"";
		} else {
			return replacementValue
		}
	} );


	//
	// Find string that was replaced by mustache and restore them
	//
	exp = exp.replace( regExMustache, function( a, b ) {
		return lstString[ b ];
	} );

	// Use the "new Function()" instead of eval()
	var result	= new Function( 'return ' + exp );

	return result();
},

processIf = function ( el ) {
	var res = { };
	var exp = getAndRemoveAttr(el, 'data-wb5-if')
	if (exp) {
		res.if = exp;
		addIfCondition( res, {
			exp: exp,
			block: el
		} );
	} else {
		if ( getAndRemoveAttr( el, 'data-wb5-else' ) != null ) {
			res.else = true;
		}
		var elseif = getAndRemoveAttr( el, 'data-wb5-elseif' )
		if ( elseif ) {
			res.elseif = elseif;
		}
	}
	return res;
},

addIfCondition = function (el, condition) {
	if (!el.ifConditions) {
		el.ifConditions = []
	}
	el.ifConditions.push(condition)
},

// @tmplId going to be replated by the Real DOM template
renderTemplate = function( dataObj, settings ) {

	// Prepare the template
	var template,
		clone,
		tmplId = settings.templateID;

	if ( tmplId ) {
		template = doc.getElementById( tmplId );
	}

	// Get the default if none
	if ( template ) {
		IE11templatePolyfill( template );
		clone = template.content.cloneNode( true );
	} else {
		var div = doc.createElement( "div" );
		div.innerHTML = settings.template;

		clone = doc.createDocumentFragment();
		clone.appendChild( div );
	}



	// Start the templating engine

	// Template cheat sheet
	// 		Document.querySelector()
	//		It only take the first occurence
	//var cssSelectorsMapping = {
	//	"CSS selector": "Property Name in the dataObj" // Need a modifier (like TextContent, ....)
	//}

	// Empty event hook
	eventsToBeHook = [];

	walk( clone, dataObj );

	return clone;
},

parseUItoJSON = function( elm, dataObj ) {

	// Check if the elm match the minimum requirement for this plugin

	if ( elm.nodeName === "SELECT" ) {
		parseSelectFromDOM( elm, dataObj );
	} else if ( elm.nodeName === "INPUT" ) {
		parseDatalistFromDOM( elm, dataObj );
	}
},

parseSelectFromDOM = function( elm, dataObj ) {

	var options = elm.options,
		i, i_cache,
		i_len = options.length;

	for( i = 0; i < i_len; i ++ ) {
		i_cache = options[ i ];

		dataObj.data.options.push(
			{
				value: i_cache.value,
				textContent: i_cache.textContent
			}
		);
	}

	dataObj.data.fieldId = elm.id || wb.getId();
	dataObj.data.fieldName = elm.name;
	dataObj.data.mustExist = true;

},

parseDatalistFromDOM = function( elm, dataObj ) {

	// Get the "list" attribute for options
	var childNodes = node.childNodes,
		i, i_cache,
		i_len = childNodes.length;

	for( i = 0; i < i_len; i ++ ) {
		i_cache = childNodes[ i ];
	}
},

externalDataSource = function( elm, dataObj ) {

	// Get the external URL data provider

	// See what it is the trigger prior to be loaded
	//	ex: onFirstUse, onFocus, onReady, onInit ....
},

/*

https://github.com/vuejs/vue/blob/dev/src/compiler/parser/index.js#L370

type ForParseResult = {
	for: string;
	alias: string;
	iterator1?: string;
	iterator2?: string;
};
*/
parseFor = function( exp ) {
	var forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
	var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
	var stripParensRE = /^\(|\)$/g;

	var inMatch = exp.match( forAliasRE );

	if ( !inMatch ) {
		return;
	}

	var res = {};

	res.for = inMatch[ 2 ].trim();

	var alias = inMatch[ 1 ].trim().replace( stripParensRE, '');

	var iteratorMatch = alias.match( forIteratorRE );

	if ( iteratorMatch ) {
		res.alias = alias.replace( forIteratorRE, '' );
		res.iterator1 = iteratorMatch[ 1 ].trim();
		if ( iteratorMatch[ 2 ] ) {
			res.iterator2 = iteratorMatch[ 2 ].trim();
		}
	} else {
		res.alias = alias
	}

	return res;
},

getObjectAt = function( dataProv, pointer ) {

	// May be consider to use JSON pointer instead ????

	pointer = pointer.trim();

	var firstCharacter = pointer.substring(0, 1),
		lastCharacter = pointer.substring(-1);

	if (firstCharacter === "'" || firstCharacter === "\"" ||
		lastCharacter === "'" || lastCharacter === "\"" ) {

		// Pointer is a string

		return pointer.substring( 1, pointer.length - 1 );
	}


	// Do we have subFunction????

	var idxOpen = pointer.indexOf( "(" ),
		idxClose = pointer.lastIndexOf( ")" ),
		attributeList = [];

	if ( idxOpen !== -1 && idxClose !== -1 && idxOpen + 1 !== idxClose ) {
		// We have an internal functin

		// Extract in between and re-process
		var newPointer = pointer.substring( 0, idxOpen ),
			attributeRaw = pointer.substring( idxOpen + 1, idxClose ),
			j, j_cache, j_len;

		attributeList = attributeRaw.split( "," );
		j_len = attributeList.length;

		for ( j = 0; j < j_len; j = j + 1 ) {
			j_cache = attributeList[ j ];


			var retValue = getObjectAt( dataProv, j_cache );

			attributeList[ j ] = retValue;

		}

		// Replace the pointer
		pointer = newPointer + "()";
	}

	var pointerParts = pointer.split( "." ),
		i_len = pointerParts.length,
		i, i_cache, fnName;

	// Get the object to be iterated
	for ( i = 0; i < i_len; i = i + 1 ) {
		i_cache = pointerParts[ i ];

		if ( !dataProv ) {
			// The object do not exist
			return undefined;
		}

		if ( i_cache.lastIndexOf( "()" ) !== -1 ) {


			// Get the function name
			fnName = i_cache.substring(0, i_cache.length - 2);

			// call the function
			if ( typeof dataProv === "string" ){

				dataProv = String.prototype[ fnName ].apply( dataProv, attributeList );
			} else {

				dataProv = dataProv[ fnName ].apply( dataProv, attributeList );
			}
		} else {

			// Get the property
			dataProv = dataProv[ i_cache ];
		}
	}

	return dataProv;
},

IE11templatePolyfill = function( elm ) {
	if ( elm.content ) {
		return;
	}
	// Polyfill Template for IE11

	var elPlate = elm,
		qContent,
		docContent;

	qContent = elPlate.childNodes;
	docContent = doc.createDocumentFragment();

	while ( qContent[ 0 ] ) {
		docContent.appendChild( qContent[ 0 ] );
	}

	elPlate.content = docContent;
},

// Parse string HTML into DOM fragment
parseHTML = function( html ) {
	var t = document.createElement('template');
	t.innerHTML = html;
	IE11templatePolyfill( t );
	return t.content.cloneNode(true);
},

// Remove accent and normalize the string
//
// str: String to be normalized
// return: A normalized string with no accent
//
unAccent = function( str ) {
	return str.normalize( "NFD" ).replace( /[\u0300-\u036f]/g, "" );
};



function wb5React(dataObj) {
	var signals = {};
	var templates = {}; // Cached template
	var tmplsDefault = {}; // Default template

	observeData(dataObj);

	return {
		data: dataObj,
		observe: observe,
		notify: notify,
		template: template,
		tmplDefault: tmplDefault,
		debug_signals: signals
	};

	function observe(property, signalHandler) {

		if (!signals[property]) signals[property] = [];

		signals[property].push(signalHandler);
	}

	function notify(signal) {
		if (!signals[signal] || signals[signal].length < 1) return;

		signals[signal].forEach(function (signalHandler) {
			return signalHandler();
		});
	}

	function template( name, template ) {
		if ( !template ) {
			// Getter
			return templates[name] || false;
		} else {
			// Setter
			templates[name] = template;
		}
	}

	function tmplDefault( name, template ) {
		if ( !template ) {
			// Getter
			return tmplsDefault[name] || false;
		} else {
			// Setter
			tmplsDefault[name] = template;
		}
	}

	function makeReactive(obj, key, keyPrefix) {
		var val = obj[key];

		if ( Array.isArray( val) ) {
			// Just make reactive those special properties
			val.wbLen = parseInt( val.length ); // Length of the array (Updated before an iteration happend on it)
			val.wbActive = 0; // Number of items that was identified being "True"

			makeReactive( val, "wbLen", key );
			makeReactive( val, "wbActive", key );
			return;
		}

		Object.defineProperty(obj, key, {
			get: function get() {
				return val;
			},
			set: function set(newVal) {
				val = newVal;
				notify( !keyPrefix ? key : keyPrefix + "." + key );
			}
		});
	}

	function observeData(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				makeReactive(obj, key);
			}
		}
		// We can safely parse the DOM looking for bindings after we converted the dataObject.
		// parseDOM(document.body, obj);
	}

	function syncNode(node, observable, property) {
		node.textContent = observable[property];
		// We remove the `Seer.` as it is now available for us in our scope.
		observe(property, function () {
			return node.textContent = observable[property];
		});
	}

	function parseDOM(node, observable) {
		var nodes = document.querySelectorAll('[s-text]');

		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var _node = _step.value;

				syncNode(_node, observable, _node.attributes['s-text'].value);
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}
	}
}
