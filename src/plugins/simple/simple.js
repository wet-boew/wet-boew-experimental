( function( window, wb, $ ) {
    var name = "wb-simple",
        selector = "." + name,
        goodbye = function() {
            this.$elm.find( ".address" ).text( "Goodbye" );
        },
        plugin = {
            name: name,
            selector: selector,
            defaults: {
                name: "world"
            },
            _create: function( $elm, settings ) {
                $elm.append( "Simple Plugin: <span class='address'>Hello</span> " + settings.name );

                return {
                    goodbye: goodbye
                };
            }
        };

    wb.addPlugin( plugin );
} )( window, window.wb, jQuery );
