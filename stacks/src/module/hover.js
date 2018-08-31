/**
* Hover class - Adds and removes classes on hover
* @author Government of Canada
* @version 1.0
* @requires Debug Event Element
*/

define( [ "module/element"], function( ElementUtil ) {
"use strict";

function handle( $elm, selector, options ) {
    
    let properties = Object.assign({ eventname: "mouseenter", classname: "open" }, options )
    var mouseOver = false;
    ElementUtil.addListener($elm,properties.eventname,function(e){
        e.stopPropagation()
        var elm = selector ? ElementUtil.nodes($elm,selector)[0] : $elm;
        var timer;
        if(e.type == "mouseenter"){
            mouseOver = true
            timer = setInterval(function(){
                if(mouseOver){
                    ElementUtil.addClass(elm, properties.classname);
                }
                clearInterval(timer);
            },500);            
        }
        else{
            mouseOver = false
            timer = setInterval(function(){
                if(!mouseOver){
                    ElementUtil.removeClass(elm, properties.classname);
                }
                clearInterval(timer);
        },500);
        }       
    });
}

return {
    handle: handle
};
} );
