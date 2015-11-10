( function( window, wb, $ ) {
    var selector = ".wb-simple",
        plugin = {
            selector: selector
        };

    wb.plugins[ selector ] = $.extend( {}, wb.plugin, plugin );
} )( window, window.wb, jQuery );
