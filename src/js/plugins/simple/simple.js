( function( window, wb, $ ) {
    var name = "wb-simple",
        selector = "." + name;

    wb.addPlugin(
        {
            name: name,
            selector: selector,
            defaults: {
                name: "world",
                i18n: {
                    "hello": "",
                    "goodbye": ""
                }
            },
            _create: function( $elm, settings ) {
                $elm.append( "Simple Plugin: <span class='address'>" + settings.i18n.hello + "</span> " + settings.name );

                return {
                    goodbye: this.goodbye
                };
            },
            goodbye: function() {
                this.$elm.find( ".address" ).text( this.settings.i18n.goodbye );
            }
        }
    );

} )( window, window.wb, jQuery );
