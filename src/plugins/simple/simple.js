( function( window, wb, $ ) {
    var name = "wb-simple",
        selector = "." + name,
        plugin = {
            name: name,
            selector: selector,
            defaults: {
                name: "world"
            },
            _create: function( $elm, settings ) {
                $elm.text( "Simple Plugin: Hello " + settings.name );
            }
        };

    wb.plugins[ selector ] = $.extend( {}, wb.plugin, plugin );
} )( window, window.wb, jQuery );
