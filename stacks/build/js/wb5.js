(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

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
polyfills.push( "css!module/core/observer" ) ;

//console.log( "load :: " + (new Date).toISOString().replace(/z|t/gi,' ') );
// =======================
// = Stage the logic set =
// =======================
require( [ "module/element"  ].concat( polyfills ), function( wbElement ) {

	var urlParams = new URLSearchParams( window.location.search ) ;

	if ( urlParams.has( "wb5" ) ) {

		var options = urlParams.get( "wb5" ).split( ":" ) ;

		lang = ( options.length > 1 ) ? options[ 1 ] : lang ;

		require( [ "css!module/accessibilty/audit/a11y-" + lang ], function() {} ) ;
	}

	var insertListener = function( event ) {
		if ( event.animationName === "nodeInserted" ) {

			var node = event.target,
				actions = wbElement.inspect( node ) ;

				for ( var idx = 0 ; idx < actions.length ; idx++ ) {
					var action = actions[ idx ] ;
					require( [ "module/" + action.command ], function( worker ) {
						worker.handle( node, action.selector, action.options ) ;
					} ) ;
				}

		}
	} ;

	document.addEventListener( "animationstart", insertListener, false ) ; // standard+ firefox
	document.addEventListener( "MSAnimationStart", insertListener, false ) ; // IE
	document.addEventListener( "webkitAnimationStart", insertListener, false ) ; // Chrome + Safari

} ) ;



define("wb5", function(){});

/**
 * Aria class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/aria',[],function() {
    "use strict" ;

	function add( $elm, key, value ) {
        var aria = "aria-" + key;
        $elm.setAttribute( aria, value );
	}

	return {
		add: add
	};
} ) ;

/**
 * Object class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/core/object',[], function() {
	"use strict" ;

	/**
	 * extend
	 * @public
	 * @param {[]Objects} args[] and array of objects to merge
	 * @returns the merged object
	 * @type Object
	 */

    function extend() {

        for ( var i = 1 ;i < arguments.length ;i++ ) {

            for ( var key in arguments[ i ] ) {
                if ( arguments[ i ].hasOwnProperty( key ) ) {
                    arguments[ 0 ][ key ] = arguments[ i ][ key ] ;
                }
            }
        }
        return arguments[ 0 ] ;

    }

    /**
     * get an object properties with a default property if not found
     * @public
     * @param {Object} object the object to search
     * @param {String} prop the property name to search
     * @param {String|Object} default value to use if none found
     * @returns the value of the object or the default provided
     * @type {String|Object}
     */

    function _get( object, prop, _default )
    {
        if ( object && object.hasOwnProperty( prop ) )
        {
            return object[prop]
        }
        return _default
    }

	return {
		extend: extend,
        get: _get
	} ;
} ) ;

/**
 * Event class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/event',["module/core/object"], function( ObjectUtil ) {
	"use strict"

	function create( event, params ) {
		var _params = Object.assign({ bubbles: true, cancelable: false, detail: undefined }, params ),
		    evt = document.createEvent( "CustomEvent" );

		evt.initCustomEvent( event, _params.bubbles, _params.cancelable, _params.detail );

		return evt;
	}

    function multiple( events, params)
    {
        var multi = [];
        for ( var evt of events.split(" ") )
        {
            multi.push( create( evt, params ) );
        }
        return multi;
    }

	return {
		create: create,
        multiple: multiple
	}
} );

/**
 * Element Store class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/element/store',[],function() {
    "use strict";

	function bless( $elm, path, value ) {

        var levels = path.split( "." ),
            curLevel = $elm,
            i = 0;

        while ( i < levels.length - 1 ) {
          if ( typeof curLevel[ levels[ i ] ] === "undefined" ) {
            curLevel[ levels[ i ] ] = {};
          }

          curLevel = curLevel[ levels[ i ] ];
          i++;
        }

        if ( value ) {
            curLevel[ levels[ levels.length - 1 ] ] = value;
        }

        return curLevel[ levels[ levels.length - 1 ] ];
	}


	return {
		bless: bless
	};
} );

/**
 * Classlist class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/element/classes',[],function() {
    "use strict";

	function isArrayLike( o ) {
	    if ( o &&                                // o is not null, undefined, etc.
	        typeof o === "object" &&            // o is an object
	        isFinite( o.length ) &&               // o.length is a finite number
	        o.length >= 0 &&                    // o.length is non-negative
	        o.length === Math.floor( o.length ) &&  // o.length is an integer
	        o.length < 4294967296 ) {
			return true;
			}

	        return false;                       // Otherwise it is not
	}

    /**
     * toggle a class on an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname the class to toggle with
     * @returns void
     */

    function toggle( $elm, classname ) {
        $elm.classList.toggle( classname );
    }

    /**
     * add a class to an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname add
     * @returns void
     */

    function add( $elm, classname ) {
		if ( !has( $elm, classname ) ) {
			$elm.classList.add( classname );
		}
    }

    /**
     * removes a class to an element
     * @private
     * @param {DOMElement} $elm the element to toggle the class to
     * @param {String} classname to remove
     * @returns void
     */

    function remove( $elm, classname ) {
		if ( has( $elm, classname ) ) {
			$elm.classList.remove( classname );
		}
    }

	/**
	* check if an element has a classname
	* @private
	* @param {DOMElement) $elm DOM element to inspect
	* @param {String) classname the classname to check for
	* @returns true or false
	* @type Boolean
	*/

	function has( $elm, classname ) {
		return $elm.classList.contains( classname );
	}

	/**
	 * insures that all elements are arrays
	 * @private
	 * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
	 * @returns Describe what it returns
	 * @type String|Object|Array|Boolean|Number
	 */

	function arrayify( $elm, func, classname ) {
		if ( !isArrayLike( $elm ) ) {
			$elm =  [ $elm ];
		}

		for ( var i = $elm.length - 1; i >= 0; i-- ) {
			func( $elm[ i ], classname );
		}
	}

	return {
		toggle: function( elm, classname ) { arrayify( elm, toggle, classname ) },
		add: function( elm, classname ) { arrayify( elm, add, classname ) },
		has: has,
		remove: function( elm, classname ) { arrayify( elm, remove, classname ) }
	};
});

/**
 * Element Command class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/element/command',[],function() {
    "use strict";

	function selectors( $elm, command, index, actionid  )
	{
		var aSelector = "data-wb5-" + actionid + "-selector";

		if ( $elm.hasAttribute( "data-wb5-selector" ) )
		{
			var selector = $elm.getAttribute( "data-wb5-selector" ).split("@");
			command[index]["selector"] = ( typeof selector[index] !== 'undefined' ) ? selector[index] : false;
		}

		if ($elm.hasAttribute( aSelector ) )
		{
			command[index]["selector"] = $elm.getAttribute( aSelector );
		}

		return command;
	}

	function options( $elm, command, index, actionid  )
	{
		var aOptions = "data-wb5-" + actionid + "-options";

		if ( $elm.hasAttribute( "data-wb5-options" ) )
		{
			var options = $elm.getAttribute( "data-wb5-options" ).split("@");
			command[index]["options"] = ( typeof options[index] !== 'undefined' ) ? JSON.parse( options[index] ) : false;
		}

		if ($elm.hasAttribute( aOptions ) )
		{
			command[index]["options"] = JSON.parse( $elm.getAttribute( aOptions ) ) ;
		}

		return command;
	}
    /**
     * inspect the data-wb5 attribute for action stack
     * @public
     * @param {String} attr the attribute text
     * @returns action object
     * @type Object
     */

	function inspect( $elm ) {
		var actions = $elm.getAttribute("data-wb5").split(" "),
			commands = [];

		// IE has a known issue with for looping and scope of var bound variable
		// - workaround - use 'var' for loops
		for (var i = 0; i < actions.length; i++) {
			var action = actions[i];

			if ( typeof commands[i] === 'undefined' )
			{
				commands[i] = { command : action, selector : false, options : false };
			}

			commands = selectors( $elm, commands, i, action);
			commands = options( $elm, commands, i, action);
			// Lets explore options
		}
		return commands;
    }


	return {
		inspect: inspect
	};
} );

/**
 * Element class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/element',["module/element/store", "module/element/classes", "module/element/command" ], function( wbStorage, wbClassList, wbCommand ) {
	"use strict";


    function store( $elm, key, value ){
        return wbStorage.bless( $elm, key, value);
    }


    /**
     * take the selector node and queries again DOM
     * @public
     * @param {DOMElement} node the context node
     * @param {String|Object|Array|Boolean|Number} paramName Describe this parameter
     * @returns Describe what it returns
     * @type String|Object|Array|Boolean|Number
     */

	function nodes( node, selector ) {
		if ( selector == null || selector == '' ) {
			return [ node ];
		}

		var context = ( selector && selector.startsWith( "#" ) ) ? document : node;

        // run the query against the required context
		return context.querySelectorAll( selector );
	}

	/**
	* Add one or more listeners to an element
	* @public
	* @param {Object} $elm - DOM element to add listeners to
	* @param {String} names - space separated list of event names, e.g. 'click change'
	* @param {Function} listener - function to attach for each event as a listener
	*/
	function addListener( $elm, names, listener ) {

		var events = names.split( " " );

		for ( var evnt of events)
		{
			$elm.addEventListener( evnt, listener, false );
		}
    }


    return {
        inspect: wbCommand.inspect,
		nodes: nodes,
        toggle: wbClassList.toggle,
        store: store,
		addClass: wbClassList.add,
		hasClass: wbClassList.has,
		removeClass: wbClassList.remove,
		addListener: addListener
    };
} );

/**
 * Broadcast class - a programmable casting event function
 * @author Government of Canada
 * @version 1.0
 * @requires Debug Event Element
 */

define( 'module/broadcast',[ "module/event", "module/element" ], function( EventUtil, ElementUtil ) {
    "use strict";

	function handle( $elm, selector, options ) {

        var properties = Object.assign({ eventname: "start", listener: "click keypress" }, options ),
        events = EventUtil.multiple( properties.eventname, options );

        ElementUtil.addListener(  $elm, properties.listener, function( evnt ) {
    		for ( var $node of ElementUtil.nodes( $elm, selector ) ) {
                for (var evt of events )
                {
                    $node.dispatchEvent( evt );
                }
    		}
        });

	}

	return {
		handle: handle
	};
} );

/**
 * Pad class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/core/pad',[],function() {
    "use strict" ;

	function start( text, targetLength, padString ) {

        text = "" + text ;

		if ( !padString || text.length >= targetLength ) {
            return text ;
          }
          var max = ( targetLength - text.length ) / padString.length ;
          for ( var i = 0 ;i < max ;i++ ) {
            text = padString + text ;
          }
          return text ;
	}

	function end( text, targetLength, padString ) {

        text = "" + text ;

		if ( !padString || text.length >= targetLength ) {
            return text ;
          }
          var max = ( targetLength - text.length ) / padString.length ;
          for ( var i = 0 ;i < max ;i++ ) {
            text += padString ;
          }

          return text ;
	}


	return {
		start: start,
		end: end
	} ;
} ) ;

/**
 * Date class
 * @author Government of Canada
 * @version 1.0
 * @requires PadUtil
 */

define( 'module/core/date',[ "module/core/pad" ], function( PadUtil ) {
	"use strict" ;

	/*
	 * Converts the date to a date-object. The input can be:
	 * <ul>
	 * <li>a Date object: returned without modification.</li>
	 * <li>an array: Interpreted as [year,month,day]. NOTE: month is 0-11.</li>
	 * <li>a number: Interpreted as number of milliseconds since 1 Jan 1970 (a timestamp).</li>
	 * <li>a string: Any format supported by the javascript engine, like 'YYYY/MM/DD', 'MM/DD/YYYY', 'Jan 31 2009' etc.</li>
	 * <li>an object: Interpreted as an object with year, month and date attributes. **NOTE** month is 0-11.</li>
	 * </ul>
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @return {Date | NaN}
	 */
	function convert( dateValue ) {
		var dateConstructor = dateValue.constructor ;

		switch ( dateConstructor ) {
		case Date:
			return dateConstructor ;
		case Array:
			return new Date( dateValue[ 0 ], dateValue[ 1 ], dateValue[ 2 ] ) ;
		case Number:
		case String:
			return new Date( dateValue ) ;
		default:
			return typeof dateValue === "object" ? new Date( dateValue.year, dateValue.month, dateValue.date ) : NaN ;
		}
	}

	/*
	 * Compares two dates (input can be any type supported by the convert function).
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue1
	 * @param {Date | number[] | number | string | object} dateValue2
	 * @return {number | NaN}
	 * @example returns
	 * -1 if dateValue1 < dateValue2
	 * 0 if dateValue1 = dateValue2
	 * 1 if dateValue1 > dateValue2
	 * NaN if dateValue1 or dateValue2 is an illegal date
	 */
	function compare( dateValue1, dateValue2 ) {
		var convert = wb.date.convert ;

		if ( isFinite( dateValue1 = convert( dateValue1 ).valueOf() ) && isFinite( dateValue2 = convert( dateValue2 ).valueOf() ) ) {
			return ( dateValue1 > dateValue2 ) - ( dateValue1 < dateValue2 ) ;
		}
		return NaN ;
	}

	/*
	 * Cross-browser safe way of translating a date to ISO format
	 * @memberof wb.date
	 * @param {Date | number[] | number | string | object} dateValue
	 * @param {boolean} withTime Optional. Whether to include the time in the result, or just the date. False if blank.
	 * @return {string}
	 * @example
	 * toDateISO( new Date() )
	 * returns "2012-04-27"
	 * toDateISO( new Date(), true )
	 * returns "2012-04-27 13:46"
	 */
	function toDateISO( dateValue, withTime ) {
		var date = convert( dateValue ) ;

		return date.getFullYear() + "-" + PadUtil.start( date.getMonth() + 1, 2, "0" ) + "-" + PadUtil.start( date.getDate(), 2, "0" ) +
			( withTime ? " " + PadUtil.start( date.getHours(), 2, "0" ) + ":" + PadUtil.start( date.getMinutes(), 2, "0" ) : "" ) ;
	}

	/*
	 * Cross-browser safe way of creating a date object from a date string in ISO format
	 * @memberof wb.date
	 * @param {string} dateISO Date string in ISO format
	 * @return {Date}
	 */
	function fromDateISO( dateISO ) {
		var date = null ;

		if ( dateISO && dateISO.match( /\d{4}-\d{2}-\d{2}/ ) ) {
			date = new Date( dateISO.substr( 0, 4 ), dateISO.substr( 5, 2 ) - 1, dateISO.substr( 8, 2 ), 0, 0, 0, 0 ) ;
		}
		return date ;
	}

	return {
		convert: convert,
		compare: compare,
		toDateISO: toDateISO,
		fromDateISO: fromDateISO
	} ;
} ) ;

/**
 * Number class
 * @author Government of Canada
 * @version 1.0
 */

define( 'module/core/number',[],function() {
	"use strict" ;

	/*
	* Returns a RFC4122 compliant Global Unique ID (GUID).
	* Originally from http://stackoverflow.com/a/2117523/455535
	*/

	function guid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function( replacementChar ) {
			var rand = Math.random() * 16 | 0,
				newChar = replacementChar === "x" ? rand : ( rand & 0x3 | 0x8 ) ;
			return newChar.toString( 16 ) ;
		} ) ;
	}

	return {
		guid: guid
	}
} ) ;

}());