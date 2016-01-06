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

    wb.addPlugin( plugin );
} )( window, window.wb, jQuery );
