/**
* Hover class - Adds and removes classes on hover/focus
* @author Government of Canada
* @version 1.0
* @requires Debug Event Element
*/

define( [ "module/element"], function( ElementUtil ) {
    "use strict";
    
    /**
    * Listens for focus/hover events
    * @private
    * @param {DOMElement} $elm - the element for which the data-wb5 attribute is located
    * @param {Object} properties - contains wb5 module configuration
    * @returns void
    */
    
    function listen( $elm , properties, siblings ) {
        let focused = false;
        ElementUtil.addListener( $elm, properties.eventname, function( e ) {
            e.stopPropagation()
            let timer;
            switch(e.type){
                case "mouseenter":
                focused = true;
                timer = setInterval( function() {
                    if( focused ){
                        ElementUtil.addClass( $elm, properties.classname );
                    }
                    clearInterval( timer );
                },500);
                break;
                case "mouseleave":
                focused = false;
                timer = setInterval( function() {
                    if( !focused ){
                        ElementUtil.removeClass( $elm, properties.classname );
                    }
                    clearInterval( timer );
                },500); 
                break;
                case "focusin":
                focused = true;
                //for (let node of siblings){
                //        ElementUtil.removeClass( node, properties.classname );
                //}
                ElementUtil.addClass( $elm, properties.classname );
                break;
                case "focusout":
                focused = false;
                ElementUtil.removeClass( $elm, properties.classname );
                break;
                
            }
        });
    }
    
    /**
    * the main function body
    * @public
    * @param {DOMElement} $elm the element for which the data-wb5 attribute is located
    * @param {String} selector the CSS3 query string to which target the children or not
    * @param {Object} options - for the element/node
    * @returns void
    */
    
    function handle( $elm, selector, options ) {
        
        let properties = Object.assign({ eventname: "mouseenter mouseleave focusin focusout", classname: "open" }, options ),
        nodes = ElementUtil.nodes( $elm, selector );
        
        for ( let node of nodes ) {
            listen( node, properties, nodes );
        }
        
    }
    
    return {
        handle: handle
    };
} );
