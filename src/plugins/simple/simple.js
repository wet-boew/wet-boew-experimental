( function( window, wb, $ ) {
    var selector = ".wb-simple",
        plugin = {
            selector: selector,
            _create: function( $elm ) {
                $elm.text( "simple plugin" );
            }
        };

    wb.plugins[ selector ] = $.extend( {}, wb.plugin, plugin );
} )( window, window.wb, jQuery );
